import React from 'react';
import { AlertCircle, RotateCcw, Trash2, Code2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

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
  const { settings } = useSettings();
  const isDark = settings.theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <AlertCircle className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Session Recovered
          </h2>
        </div>

        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We found unsaved work from your last session ({timeAgo(lastSavedAt)}). Would you like to restore it?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestore}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Restore Session
          </button>
          
          <div className="flex gap-3">
            {onViewDiff && (
              <button
                onClick={onViewDiff}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors border ${
                  isDark 
                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
                View Diff
              </button>
            )}
            
            <button
              onClick={onStartFresh}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors border ${
                isDark 
                  ? 'border-red-900/30 hover:bg-red-900/20 text-red-400' 
                  : 'border-red-200 hover:bg-red-50 text-red-600'
              }`}
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
