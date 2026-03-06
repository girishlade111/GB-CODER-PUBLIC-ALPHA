// Screenshot Capture Service
import { toPng, toJpeg, toSvg } from 'html-to-image';

export interface ScreenshotOptions {
  format: 'png' | 'jpeg' | 'svg';
  quality?: number;
  includeWatermark?: boolean;
  watermarkText?: string;
}

export class ScreenshotService {
  private static instance: ScreenshotService;

  private constructor() {}

  public static getInstance(): ScreenshotService {
    if (!ScreenshotService.instance) {
      ScreenshotService.instance = new ScreenshotService();
    }
    return ScreenshotService.instance;
  }

  public async capturePreview(
    previewElement: HTMLElement,
    options: ScreenshotOptions = { format: 'png', quality: 0.95, includeWatermark: true }
  ): Promise<string> {
    const { format, quality, includeWatermark, watermarkText } = options;

    if (!previewElement) {
      throw new Error('Preview element not found');
    }

    try {
      console.log('Starting screenshot capture...', { format, quality });

      // Wait for any images to load
      await this.waitForImages(previewElement);

      let dataUrl: string;

      // Configure options for html-to-image
      const captureOptions = {
        quality: quality || 0.95,
        width: previewElement.offsetWidth,
        height: previewElement.offsetHeight,
        style: {
          backgroundColor: '#ffffff',
        },
      };

      switch (format) {
        case 'jpeg':
          console.log('Capturing as JPEG...');
          dataUrl = await toJpeg(previewElement, {
            ...captureOptions,
            backgroundColor: '#ffffff',
          });
          break;
        case 'svg':
          console.log('Capturing as SVG...');
          dataUrl = await toSvg(previewElement, captureOptions);
          break;
        case 'png':
        default:
          console.log('Capturing as PNG...');
          dataUrl = await toPng(previewElement, captureOptions);
          break;
      }

      console.log('Screenshot captured successfully');

      // Add watermark if requested
      if (includeWatermark && watermarkText) {
        dataUrl = await this.addWatermarkToImage(dataUrl, watermarkText);
      }

      return dataUrl;
    } catch (error: any) {
      console.error('Screenshot capture failed:', error);
      throw new Error(`Screenshot failed: ${error.message}`);
    }
  }

  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        // Timeout after 2 seconds
        setTimeout(resolve, 2000);
      });
    });

    await Promise.all(promises);
    
    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async addWatermarkToImage(imageUrl: string, text: string): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add watermark with better visibility
        const fontSize = Math.max(14, img.width / 40);
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, img.width - 15, img.height - 15);
        
        // Reset shadow and add outline
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeText(text, img.width - 15, img.height - 15);

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        console.warn('Failed to load image for watermark, returning original');
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  }

  public downloadScreenshot(dataUrl: string, filename: string): void {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Screenshot downloaded:', filename);
    } catch (error: any) {
      console.error('Download failed:', error);
      throw new Error('Failed to download screenshot');
    }
  }

  public async captureToClipboard(dataUrl: string): Promise<boolean> {
    try {
      console.log('Copying screenshot to clipboard...');
      
      // Check if Clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.write) {
        console.warn('Clipboard API not available');
        throw new Error('Clipboard API not available in this browser. Please use Chrome or Edge.');
      }

      // Convert data URL to blob without using fetch (avoids CORS issues)
      const blob = this.dataURLToBlob(dataUrl);
      
      if (!blob) {
        throw new Error('Failed to convert image to blob');
      }

      console.log('Writing to clipboard...');
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      
      console.log('Screenshot copied to clipboard successfully');
      return true;
    } catch (error: any) {
      console.error('Clipboard write failed:', error);
      throw new Error(`Failed to copy: ${error.message}`);
    }
  }

  /**
   * Convert data URL to Blob without using fetch
   */
  private dataURLToBlob(dataUrl: string): Blob | null {
    try {
      // Parse data URL
      const arr = dataUrl.split(',');
      if (arr.length < 2) {
        console.error('Invalid data URL format');
        return null;
      }

      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        console.error('Invalid MIME type in data URL');
        return null;
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], { type: mime });
    } catch (error: any) {
      console.error('dataURLToBlob failed:', error);
      return null;
    }
  }

  // Alternative capture method using canvas
  public async captureWithCanvas(element: HTMLElement, format: 'png' | 'jpeg' = 'png'): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = element.offsetWidth;
      canvas.height = element.offsetHeight;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw element (this is a simplified version)
      // For full implementation, use html-to-image library
      const dataUrl = await toPng(element, {
        width: element.offsetWidth,
        height: element.offsetHeight,
        quality: 0.95,
      });

      return dataUrl;
    } catch (error: any) {
      console.error('Canvas capture failed:', error);
      throw new Error('Canvas capture failed');
    }
  }
}

export const screenshotService = ScreenshotService.getInstance();
