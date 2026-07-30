import { diffLines, Change } from 'diff';
import { EditorLanguage } from '../types';
import { FormatResult, DiffResult, FormatSettings, DEFAULT_FORMAT_SETTINGS } from '../types/formatting';

class FormattingService {
    private settings: FormatSettings = DEFAULT_FORMAT_SETTINGS;
    private prettierModule: any = null;

    private async loadPrettier() {
        if (!this.prettierModule) {
            const [prettier, pluginHTML, pluginCSS, pluginJS, pluginESTree] = await Promise.all([
                import('prettier/standalone'),
                import('prettier/plugins/html'),
                import('prettier/plugins/postcss'),
                import('prettier/plugins/babel'),
                import('prettier/plugins/estree'),
            ]);
            this.prettierModule = {
                prettier: prettier.default || prettier,
                pluginHTML: pluginHTML.default || pluginHTML,
                pluginCSS: pluginCSS.default || pluginCSS,
                pluginJS: pluginJS.default || pluginJS,
                pluginESTree: pluginESTree.default || pluginESTree,
            };
        }
        return this.prettierModule;
    }

    updateSettings(newSettings: Partial<FormatSettings>): void {
        this.settings = { ...this.settings, ...newSettings };
    }

    getSettings(): FormatSettings {
        return { ...this.settings };
    }

    async formatCode(code: string, language: EditorLanguage): Promise<FormatResult> {
        try {
            if (!code.trim()) {
                return {
                    success: true,
                    formattedCode: code,
                    changelog: [],
                    isUnsafe: false,
                    diff: [],
                    language,
                };
            }

            const { prettier, pluginHTML, pluginCSS, pluginJS, pluginESTree } = await this.loadPrettier();
            const { parser, plugins } = this.getParserConfig(language, { pluginHTML, pluginCSS, pluginJS, pluginESTree });
            const formattedCode = await prettier.format(code, {
                parser,
                plugins,
                printWidth: this.settings.printWidth,
                tabWidth: this.settings.tabWidth,
                useTabs: false,
                semi: this.settings.addSemicolons,
                singleQuote: this.settings.useSingleQuotes,
                trailingComma: this.settings.addTrailingCommas ? 'es5' : 'none',
                bracketSpacing: true,
                arrowParens: 'avoid',
                htmlWhitespaceSensitivity: 'css',
            });

            const diff = this.generateDiff(code, formattedCode);
            const changelog = this.generateChangelog(code, formattedCode, language, diff);
            const isUnsafe = this.detectUnsafeChanges(code, formattedCode, language);

            return {
                success: true,
                formattedCode,
                changelog,
                isUnsafe,
                diff,
                language,
            };
        } catch (error) {
            return {
                success: false,
                formattedCode: code,
                changelog: [],
                isUnsafe: false,
                diff: [],
                error: error instanceof Error ? error.message : 'Unknown formatting error',
                language,
            };
        }
    }

    private getParserConfig(language: EditorLanguage, plugins: { pluginHTML: any; pluginCSS: any; pluginJS: any; pluginESTree: any }): { parser: string; plugins: any[] } {
        switch (language) {
            case 'html':
                return { parser: 'html', plugins: [plugins.pluginHTML] };
            case 'css':
                return { parser: 'css', plugins: [plugins.pluginCSS] };
            case 'javascript':
                return { parser: 'babel', plugins: [plugins.pluginJS, plugins.pluginESTree] };
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private generateDiff(original: string, formatted: string): DiffResult[] {
        const changes: Change[] = diffLines(original, formatted);
        const diffResults: DiffResult[] = [];
        let lineNumber = 0;

        changes.forEach(change => {
            const lines = change.value.split('\n').filter((line: string, idx: number, arr: string[]) => {
                return idx < arr.length - 1 || line !== '';
            });

            lines.forEach((line: string) => {
                if (change.added) {
                    diffResults.push({ type: 'add', lineNumber, formattedLine: line, content: line });
                } else if (change.removed) {
                    diffResults.push({ type: 'remove', lineNumber, originalLine: line, content: line });
                    lineNumber++;
                } else {
                    diffResults.push({ type: 'unchanged', lineNumber, originalLine: line, formattedLine: line, content: line });
                    lineNumber++;
                }
            });
        });

        return diffResults;
    }

    private generateChangelog(original: string, formatted: string, language: EditorLanguage, diff: DiffResult[]): string[] {
        if (original.trim() === formatted.trim()) {
            return ['No formatting changes needed'];
        }

        const changeList: { message: string; count: number }[] = [];
        let indentCount = 0, spacingCount = 0, semicolonCount = 0;

        diff.forEach((d: DiffResult) => {
            if (d.type === 'add' || d.type === 'remove') {
                const content = d.content || '';

                if (d.originalLine && d.formattedLine && d.originalLine !== d.formattedLine) {
                    const origSpaces = d.originalLine.match(/^\s*/)?.[0].length || 0;
                    const fmtSpaces = d.formattedLine.match(/^\s*/)?.[0].length || 0;
                    if (origSpaces !== fmtSpaces) indentCount++;
                }

                if (content.match(/\s{2,}/)) spacingCount++;
                if (language === 'javascript' && content.includes(';')) semicolonCount++;
            }
        });

        if (indentCount > 0) changeList.push({ message: `Normalized indentation (${indentCount} lines)`, count: indentCount });
        if (spacingCount > 2) changeList.push({ message: 'Fixed spacing and alignment', count: spacingCount });
        if (semicolonCount > 0 && language === 'javascript') changeList.push({ message: `Added missing semicolons (${semicolonCount})`, count: semicolonCount });

        changeList.sort((a, b) => b.count - a.count);
        const changelog = changeList.slice(0, 3).map(c => c.message);

        return changelog.length > 0 ? changelog : ['Applied code formatting'];
    }

    private detectUnsafeChanges(original: string, formatted: string, language: EditorLanguage): boolean {
        if (language !== 'javascript') return false;

        const origLines = original.split('\n').filter(line => line.trim());
        const fmtLines = formatted.split('\n').filter(line => line.trim());

        if (Math.abs(origLines.length - fmtLines.length) > origLines.length * 0.3) return true;

        const hasIIFE = /\(\s*function\s*\([^)]*\)\s*\{[\s\S]*\}\s*\)\s*\(/.test(original);
        const hasIIFEAfter = /\(\s*function\s*\([^)]*\)\s*\{[\s\S]*\}\s*\)\s*\(/.test(formatted);
        if (hasIIFE !== hasIIFEAfter) return true;

        return false;
    }
}

export const formattingService = new FormattingService();
