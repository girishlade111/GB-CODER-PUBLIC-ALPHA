import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

/**
 * Fixed bottom status bar — a hairline strip on the canvas, not a floating
 * dark band. The "Saved" confirmation is the only content, so it stays right
 * aligned and muted, fading in on the autosave event.
 */
const StatusBar: React.FC = () => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleAutoSave = () => {
      setShowSaved(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setShowSaved(false), 2000);
    };

    window.addEventListener('autosave', handleAutoSave);

    return () => {
      window.removeEventListener('autosave', handleAutoSave);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-6 items-center border-t border-stroke-subtle bg-surface-canvas px-4">
      <div className="flex-1" />

      <div className="flex items-center">
        <div
          className={`flex items-center gap-1.5 text-2xs font-medium text-content-muted transition-opacity duration-300 ${
            showSaved ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Check className="h-3 w-3 text-success" />
          <span>Saved</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;