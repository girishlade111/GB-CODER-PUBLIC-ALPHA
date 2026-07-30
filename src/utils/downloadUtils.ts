/**
 * NOTE: `downloadAsZip` was removed — it produced an index.html with no <link>
 * or <script> tags (an unstyled, inert page) and could not represent multi-file
 * projects. All ZIP export now goes through `services/projectArchiveService`.
 */
export const downloadSingleFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
