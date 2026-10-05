import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Check, Zap, ZapOff } from 'lucide-react';
import {
  inlineCopilotService,
  type InlineCopilotState,
} from '../services/inlineCopilotService';

/**
 * Fixed bottom status bar — a hairline strip on the canvas, not a floating
 * dark band. The "Saved" confirmation and the inline AI copilot state are the
 * only content, so they stay right aligned and muted: "Saved" fades in on the
 * autosave event, the copilot chip sits beside it.
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

      <div className="flex items-center gap-3">
        <InlineCopilotIndicator />

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

/**
 * Reads the copilot store through `useSyncExternalStore`, which is how the
 * sandbox and voice services already push state into React.
 */
const InlineCopilotIndicator: React.FC = () => {
  const state = useSyncExternalStore<InlineCopilotState>(
    inlineCopilotService.subscribe,
    inlineCopilotService.getState,
    inlineCopilotService.getState,
  );

  const { status, error } = state;

  if (status === 'disabled') {
    return (
      <div
        className="flex items-center gap-1.5 text-2xs font-medium text-content-muted opacity-60"
        title="Inline AI Copilot is off. Enable it in Settings → Behavior."
      >
        <ZapOff className="h-3 w-3" />
        <span>Copilot: Disabled</span>
      </div>
    );
  }

  const thinking = status === 'thinking';

  return (
    <div
      className={`flex items-center gap-1.5 text-2xs font-medium text-content-muted transition-opacity duration-300 ${
        thinking ? 'opacity-100' : 'opacity-70'
      }`}
      title={
        error ||
        (thinking
          ? 'Waiting for a suggestion…'
          : 'Inline AI Copilot is on. Press Tab to accept a suggestion, Escape to dismiss it.')
      }
    >
      <Zap
        className={`h-3 w-3 ${thinking ? 'text-amber animate-pulse' : 'text-success'}`}
      />
      <span>{thinking ? 'Copilot: Thinking' : 'Copilot: Ready'}</span>
    </div>
  );
};

export default StatusBar;