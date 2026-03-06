export interface MinifyResult {
  success: boolean;
  minifiedCode: string;
  originalSize: number;
  minifiedSize: number;
  error?: string;
}

class CodeMinifierService {
  async minifyCode(
    code: string,
    language: "html" | "css" | "javascript",
  ): Promise<MinifyResult> {
    const originalSize = code.length;

    try {
      let minifiedCode: string;

      switch (language) {
        case "html":
          minifiedCode = this.minifyHtml(code);
          break;
        case "css":
          minifiedCode = this.minifyCss(code);
          break;
        case "javascript":
          minifiedCode = this.minifyJavascript(code);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      return {
        success: true,
        minifiedCode,
        originalSize,
        minifiedSize: minifiedCode.length,
      };
    } catch (error) {
      return {
        success: false,
        minifiedCode: code,
        originalSize,
        minifiedSize: originalSize,
        error:
          error instanceof Error ? error.message : "Unknown minification error",
      };
    }
  }

  private minifyHtml(code: string): string {
    let result = code;

    result = result.replace(/<!--[\s\S]*?-->/g, "");

    result = result.replace(/>\s+</g, "><");

    result = result.replace(/\s+>/g, ">");
    result = result.replace(/<\s+/g, "<");

    result = result.replace(/([a-zA-Z-]+)=""(?=\s|[/>])/g, "$1");

    result = result.replace(/^\s+|\s+$/gm, "");

    result = result.replace(/\s{2,}/g, " ");

    result = result.replace(/>\s+</g, "><");

    return result.trim();
  }

  private minifyCss(code: string): string {
    let result = code;

    result = result.replace(/\/\*[\s\S]*?\*\//g, "");

    result = result.replace(/\s*{\s*/g, "{");
    result = result.replace(/\s*}\s*/g, "}");
    result = result.replace(/\s*;\s*/g, ";");
    result = result.replace(/\s*:\s*/g, ":");
    result = result.replace(/\s*,\s*/g, ",");
    result = result.replace(/\s*\+\s*/g, "+");
    result = result.replace(/\s*>\s*/g, ">");
    result = result.replace(/\s*~\s*/g, "~");

    result = result.replace(/;}/g, "}");

    result = result.replace(
      /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/gi,
      "#$1$2$3",
    );

    result = result.replace(/#ffffff/gi, "#fff");
    result = result.replace(/#000000/gi, "#000");

    result = result.replace(/\s{2,}/g, " ");

    result = result.replace(/^\s+|\s+$/gm, "");

    return result.trim();
  }

  private minifyJavascript(code: string): string {
    let result = code;

    result = result.replace(/\/\/.*$/gm, "");

    result = result.replace(/\/\*[\s\S]*?\*\//g, "");

    result = result.replace(/\s+/g, " ");

    result = result.replace(/\s*([=+\-*/%<>!&|^~?:])\s*/g, "$1");

    result = result.replace(/;\s*;/g, ";");

    result = result.replace(/{\s*/g, "{");
    result = result.replace(/\s*}/g, "}");
    result = result.replace(/\s*\(\s*/g, "(");
    result = result.replace(/\s*\)\s*/g, ")");
    result = result.replace(/\s*\[\s*/g, "[");
    result = result.replace(/\s*\]\s*/g, "]");

    result = result.replace(/;\s*}/g, "}");

    result = result.replace(/^\s+|\s+$/gm, "");

    result = result.replace(/^(\s*[\r\n]+)+|(\s*[\r\n]+)+$/g, "");

    return result.trim();
  }
}

export const codeMinifierService = new CodeMinifierService();
