import { Project } from '../types/project';


/**
 * Generate a complete HTML file with linked CSS and JS
 */
function generateIndexHtml(project: Project): string {
    const { html, externalLibraries } = project;

    // Get external library tags
    const cssLibraries = externalLibraries
        .filter(lib => lib.type === 'css')
        .map(lib => `  <link rel="stylesheet" href="${lib.url}" crossorigin="anonymous">`)
        .join('\n');

    const jsLibraries = externalLibraries
        .filter(lib => lib.type === 'js')
        .map(lib => `  <script src="${lib.url}" crossorigin="anonymous"></script>`)
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
${cssLibraries ? cssLibraries + '\n' : ''}  <link rel="stylesheet" href="style.css">
</head>
<body>
${html}
${jsLibraries ? '\n' + jsLibraries + '\n' : ''}  <script src="script.js"></script>
</body>
</html>`;
}

/**
 * Export a project as a ZIP file
 */
export async function exportProjectAsZip(project: Project): Promise<void> {
    try {
        // Loaded on demand so JSZip stays out of any eager import chain.
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();

        // Add index.html
        const indexHtml = generateIndexHtml(project);
        zip.file('index.html', indexHtml);

        // Add style.css
        zip.file('style.css', project.css);

        // Add script.js
        zip.file('script.js', project.javascript);

        // Generate ZIP file
        const blob = await zip.generateAsync({ type: 'blob' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizeFilename(project.name)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);

        console.log(`Exported project "${project.name}" as ZIP`);
    } catch (error) {
        console.error('Failed to export project:', error);
        throw new Error('Failed to export project as ZIP');
    }
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
}

/**
 * Export project as separate files (alternative to ZIP)
 */
export function downloadProjectFiles(project: Project): void {
    // Download HTML
    downloadFile(
        generateIndexHtml(project),
        `${sanitizeFilename(project.name)}.html`,
        'text/html'
    );

    // Download CSS
    if (project.css.trim()) {
        downloadFile(
            project.css,
            `${sanitizeFilename(project.name)}.css`,
            'text/css'
        );
    }

    // Download JS
    if (project.javascript.trim()) {
        downloadFile(
            project.javascript,
            `${sanitizeFilename(project.name)}.js`,
            'text/javascript'
        );
    }
}

/**
 * Helper to download a single file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
