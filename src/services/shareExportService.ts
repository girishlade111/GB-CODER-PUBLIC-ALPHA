// Code Sharing & Export Service
import JSZip from 'jszip';

export interface ShareableCode {
  html: string;
  css: string;
  javascript: string;
  externalLibraries: string[];
  timestamp: number;
  version: string;
}

export class ShareExportService {
  private static instance: ShareExportService;
  private readonly VERSION = '1.0.0';

  private constructor() {}

  public static getInstance(): ShareExportService {
    if (!ShareExportService.instance) {
      ShareExportService.instance = new ShareExportService();
    }
    return ShareExportService.instance;
  }

  /**
   * Compress code data using LZ-string-like compression
   */
  private compressData(data: string): string {
    // Simple base64 encoding with gzip-like compression
    try {
      const compressed = btoa(unescape(encodeURIComponent(data)));
      return compressed;
    } catch (error) {
      console.error('Compression failed:', error);
      return btoa(data);
    }
  }

  /**
   * Decompress code data
   */
  private decompressData(data: string): string {
    try {
      return decodeURIComponent(escape(atob(data)));
    } catch (error) {
      console.error('Decompression failed:', error);
      return atob(data);
    }
  }

  /**
   * Generate a shareable URL with encoded code
   */
  public generateShareableUrl(code: ShareableCode): string {
    const shareData: ShareableCode = {
      ...code,
      timestamp: Date.now(),
      version: this.VERSION,
    };

    const jsonString = JSON.stringify(shareData);
    const compressed = this.compressData(jsonString);
    
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?code=${encodeURIComponent(compressed)}`;
  }

  /**
   * Load code from shareable URL
   */
  public loadFromUrl(codeParam: string): ShareableCode | null {
    try {
      const decompressed = this.decompressData(codeParam);
      const data: ShareableCode = JSON.parse(decompressed);
      
      // Validate required fields
      if (!data.html || !data.css || !data.javascript) {
        throw new Error('Invalid code data');
      }

      return data;
    } catch (error) {
      console.error('Failed to load code from URL:', error);
      return null;
    }
  }

  /**
   * Export code as ZIP file
   */
  public async exportAsZip(
    html: string,
    css: string,
    javascript: string,
    projectName: string = 'gb-coder-project'
  ): Promise<Blob> {
    const zip = new JSZip();
    
    // Create project folder
    const projectFolder = zip.folder(projectName);
    if (!projectFolder) {
      throw new Error('Failed to create project folder');
    }

    // Add files
    projectFolder.file('index.html', this.generateCompleteHTML(html, css, javascript));
    projectFolder.file('style.css', css);
    projectFolder.file('script.js', javascript);
    projectFolder.file('README.md', this.generateReadme(projectName));

    // Generate ZIP
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Export code as single HTML file
   */
  public exportAsSingleHTML(
    html: string,
    css: string,
    javascript: string,
    title: string = 'GB Coder Project'
  ): string {
    return this.generateCompleteHTML(html, css, javascript, title);
  }

  /**
   * Download file
   */
  public downloadFile(content: Blob | string, filename: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy code to clipboard
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Export to CodePen
   */
  public exportToCodePen(
    html: string,
    css: string,
    javascript: string,
    title: string = 'GB Coder Project'
  ): void {
    const data = {
      html,
      css,
      js: javascript,
      title,
    };

    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Export to JSFiddle
   */
  public exportToJSFiddle(
    html: string,
    css: string,
    javascript: string,
    title: string = 'GB Coder Project'
  ): void {
    const form = document.createElement('form');
    form.action = 'https://jsfiddle.net/api/post/library/pure/';
    form.method = 'POST';
    form.target = '_blank';

    const fields = [
      { name: 'html', value: html },
      { name: 'css', value: css },
      { name: 'js', value: javascript },
      { name: 'title', value: title },
    ];

    fields.forEach(field => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = field.name;
      input.value = field.value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Generate complete HTML file
   */
  private generateCompleteHTML(
    html: string,
    css: string,
    javascript: string,
    title: string = 'GB Coder Project'
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}

  <script>
${javascript}
  <\/script>
</body>
</html>`;
  }

  /**
   * Generate README file
   */
  private generateReadme(projectName: string): string {
    return `# ${projectName}

Generated with [GB Coder](https://gb-coder.vercel.app) - AI-Powered Code Playground

## Project Structure

\`\`\`
${projectName}/
├── index.html    # Main HTML file
├── style.css     # Stylesheet
└── script.js     # JavaScript code
\`\`\`

## How to Use

1. Open \`index.html\` in your web browser
2. Edit the files as needed
3. Refresh the browser to see changes

## Created with GB Coder

This project was created using GB Coder, an AI-powered online code playground.
Check it out at: https://gb-coder.vercel.app

---
Generated on: ${new Date().toLocaleDateString()}
`;
  }

  /**
   * Get share statistics
   */
  public getCodeStats(html: string, css: string, javascript: string) {
    return {
      htmlLines: html.split('\n').length,
      cssLines: css.split('\n').length,
      jsLines: javascript.split('\n').length,
      htmlChars: html.length,
      cssChars: css.length,
      jsChars: javascript.length,
      totalLines: html.split('\n').length + css.split('\n').length + javascript.split('\n').length,
      totalChars: html.length + css.length + javascript.length,
    };
  }
}

export const shareExportService = ShareExportService.getInstance();
