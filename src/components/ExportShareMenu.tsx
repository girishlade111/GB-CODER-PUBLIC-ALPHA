import React, { useState, useCallback } from 'react';
import { Camera, Download, Share2, Copy, FileCode, ExternalLink, Image, FileArchive, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { screenshotService } from '../services/screenshotService';
import { shareExportService } from '../services/shareExportService';
import toast from 'react-hot-toast';

interface ExportShareMenuProps {
  previewRef: React.RefObject<HTMLElement>;
  html: string;
  css: string;
  javascript: string;
  externalLibraries: string[];
}

const ExportShareMenu: React.FC<ExportShareMenuProps> = ({
  previewRef,
  html,
  css,
  javascript,
  externalLibraries,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleScreenshot = useCallback(async (format: 'png' | 'jpeg' | 'svg') => {
    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    setIsCapturing(true);
    try {
      console.log('Capturing screenshot...', previewRef.current);
      
      const dataUrl = await screenshotService.capturePreview(previewRef.current, {
        format,
        quality: 0.95,
        includeWatermark: true,
      });

      console.log('Screenshot captured, downloading...');
      screenshotService.downloadScreenshot(dataUrl, `gb-coder-screenshot.${format}`);
      toast.success(`Screenshot saved as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Screenshot error:', error);
      toast.error(`Failed to capture screenshot: ${error.message}`);
    } finally {
      setIsCapturing(false);
      setIsOpen(false);
    }
  }, [previewRef]);

  const handleCopyScreenshot = useCallback(async () => {
    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    setIsCapturing(true);
    try {
      const dataUrl = await screenshotService.capturePreview(previewRef.current, {
        format: 'png',
        quality: 0.95,
        includeWatermark: true,
      });

      const success = await screenshotService.captureToClipboard(dataUrl);
      if (success) {
        toast.success('Screenshot copied to clipboard!');
        setCopiedItem('screenshot');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        toast.error('Failed to copy to clipboard');
      }
    } catch (error: any) {
      console.error('Copy screenshot error:', error);
      toast.error(`Failed to copy: ${error.message}`);
    } finally {
      setIsCapturing(false);
      setIsOpen(false);
    }
  }, [previewRef]);

  const handleShareUrl = useCallback(() => {
    try {
      const url = shareExportService.generateShareableUrl({
        html,
        css,
        javascript,
        externalLibraries,
        timestamp: Date.now(),
        version: '1.0.0',
      });

      const success = shareExportService.copyToClipboard(url);
      if (success) {
        toast.success('Shareable URL copied to clipboard!');
        setCopiedItem('url');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        toast.error('Failed to copy URL');
      }
    } catch (error: any) {
      console.error('Share URL error:', error);
      toast.error(`Failed to generate URL: ${error.message}`);
    } finally {
      setIsOpen(false);
    }
  }, [html, css, javascript, externalLibraries]);

  const handleExportHTML = useCallback(() => {
    try {
      const content = shareExportService.exportAsSingleHTML(html, css, javascript);
      shareExportService.downloadFile(content, 'index.html');
      toast.success('Downloaded as HTML file');
      setCopiedItem('html');
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error: any) {
      console.error('Export HTML error:', error);
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setIsOpen(false);
    }
  }, [html, css, javascript]);

  const handleExportZIP = useCallback(async () => {
    setIsCapturing(true);
    try {
      const zipBlob = await shareExportService.exportAsZip(html, css, javascript);
      shareExportService.downloadFile(zipBlob, 'gb-coder-project.zip');
      toast.success('Project downloaded as ZIP');
      setCopiedItem('zip');
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error: any) {
      console.error('Export ZIP error:', error);
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setIsCapturing(false);
      setIsOpen(false);
    }
  }, [html, css, javascript]);

  const handleExportCodePen = useCallback(() => {
    try {
      shareExportService.exportToCodePen(html, css, javascript);
      toast.success('Opening in CodePen...');
    } catch (error: any) {
      console.error('CodePen export error:', error);
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setIsOpen(false);
    }
  }, [html, css, javascript]);

  const handleExportJSFiddle = useCallback(() => {
    try {
      shareExportService.exportToJSFiddle(html, css, javascript);
      toast.success('Opening in JSFiddle...');
    } catch (error: any) {
      console.error('JSFiddle export error:', error);
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setIsOpen(false);
    }
  }, [html, css, javascript]);

  const menuItems = [
    {
      category: 'Screenshot',
      items: [
        { icon: Image, label: 'Save as PNG', onClick: () => handleScreenshot('png'), copied: copiedItem === 'png' },
        { icon: Image, label: 'Save as JPEG', onClick: () => handleScreenshot('jpeg'), copied: copiedItem === 'jpeg' },
        { icon: Image, label: 'Save as SVG', onClick: () => handleScreenshot('svg'), copied: copiedItem === 'svg' },
        { icon: copiedItem === 'screenshot' ? Check : Copy, label: 'Copy to Clipboard', onClick: handleCopyScreenshot, copied: copiedItem === 'screenshot' },
      ],
    },
    {
      category: 'Export',
      items: [
        { icon: copiedItem === 'html' ? Check : FileCode, label: 'Export as HTML', onClick: handleExportHTML, copied: copiedItem === 'html' },
        { icon: copiedItem === 'zip' ? Check : FileArchive, label: 'Export as ZIP', onClick: handleExportZIP, copied: copiedItem === 'zip', loading: isCapturing },
      ],
    },
    {
      category: 'Share',
      items: [
        { icon: copiedItem === 'url' ? Check : Share2, label: 'Generate Share URL', onClick: handleShareUrl, copied: copiedItem === 'url' },
        { icon: ExternalLink, label: 'Export to CodePen', onClick: handleExportCodePen },
        { icon: ExternalLink, label: 'Export to JSFiddle', onClick: handleExportJSFiddle },
      ],
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isCapturing}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Export & Share"
      >
        {isCapturing ? (
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border z-50 overflow-hidden ${
              isDark
                ? 'bg-matte-black border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {sectionIdx > 0 && (
                  <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                )}
                <div className="p-2">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 px-2 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {section.category}
                  </h3>
                  {section.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={item.onClick}
                      disabled={item.loading}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${item.copied ? (isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600') : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.copied ? 'text-green-500' : 'text-purple-500'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.loading && (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportShareMenu;
