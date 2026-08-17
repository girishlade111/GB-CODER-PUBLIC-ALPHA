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
      <div className="w-full max-w-md p-6 rounded-lg border border-[#2a2a2a] bg-[#161616]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-md bg-[#e07856]/10">
            <AlertCircle className="w-6 h-6 text-[#e07856]" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#e8e8e8]">
            Session Recovered
          </h2>
        </div>

        <p className="mb-6 text-[#8a8a8a] text-sm">
          We found unsaved work from your last session ({timeAgo(lastSavedAt)}). Would you like to restore it?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestore}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#e07856] hover:bg-[#e88a6d] text-[#e8e8e8] rounded-md font-medium transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Session
          </button>
          
          <div className="flex gap-3">
            {onViewDiff && (
              <button
                onClick={onViewDiff}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors border border-[#2a2a2a] bg-[#1c1c1c] hover:bg-[#242424] text-[#8a8a8a] hover:text-[#e8e8e8] text-sm"
              >
                <Code2 className="w-4 h-4" />
                View Diff
              </button>
            )}
            
            <button
              onClick={onStartFresh}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors border border-[#e5484d]/30 bg-[#e5484d]/08 hover:bg-[#e5484d]/15 text-[#e5484d] text-sm"
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
