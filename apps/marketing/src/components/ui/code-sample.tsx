// Focused Astro-island adaptation of Kibo UI's MIT CodeBlock composition.
// Header/body/copy structure retained; code is rendered as safe React text.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";

export function CodeSample({
  code,
  filename,
  copyLabel,
  copiedLabel,
  errorLabel,
  icon,
}: {
  code: string;
  filename: string;
  copyLabel: string;
  copiedLabel: string;
  errorLabel: string;
  /** Optional leading glyph, drawn from the site's shared icon set. */
  icon?: ReactNode;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setStatus("idle");
    clearTimeout(timer.current);
  }, [code]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }
  return (
    <div className="sample-code">
      <div className="sample-code-header">
        <span className="sample-filename">
          {icon}
          {filename}
        </span>
        <Button variant="ghost" onClick={copy} aria-label={copyLabel} className="copy-btn">
          <span className="copy-text">{status === "copied" ? copiedLabel : copyLabel}</span>
        </Button>
      </div>
      <pre tabIndex={0} aria-label={filename}>
        <code>
          {code.split("\n").map((line, i) => (
            <span className="sample-line" key={i}>
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span>{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
      <span className="sample-copy-status" role="status">
        {status === "copied"
          ? copiedLabel
          : status === "error"
            ? errorLabel
            : ""}
      </span>
    </div>
  );
}
