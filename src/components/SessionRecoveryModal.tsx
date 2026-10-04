import React from 'react';
import { AlertCircle, RotateCcw, Trash2, Code2 } from 'lucide-react';

interface SessionRecoveryModalProps {
  lastSavedAt: string;
  onRestore: () => void;
  onStartFresh: () => void;
  onViewDiff?: () => void;
}

const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  lastSavedAt,
  onRestore,
  onStartFresh,
  onViewDiff
}) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md p-6 rounded-lg border border-stroke-dark bg-product">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-md bg-accent/10">
            <AlertCircle className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-sans text-[18px] font-medium text-content-on-dark">
            Session Recovered
          </h2>
        </div>

        <p className="mb-6 text-content-on-dark-soft text-sm">
          We found unsaved work from your last session ({timeAgo(lastSavedAt)}). Would you like to restore it?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestore}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-content-on-dark rounded-md font-medium transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Session
          </button>
          
          <div className="flex gap-3">
            {onViewDiff && (
              <button
                onClick={onViewDiff}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors border border-stroke-dark bg-product-elevated hover:bg-product-active text-content-on-dark-soft hover:text-content-on-dark text-sm"
              >
                <Code2 className="w-4 h-4" />
                View Diff
              </button>
            )}
            
            <button
              onClick={onStartFresh}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors border border-danger bg-danger hover:bg-danger text-danger text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRecoveryModal;
