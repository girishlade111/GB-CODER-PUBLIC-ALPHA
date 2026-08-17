import React, { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface SaveStatusIndicatorProps {
  lastSaveTime?: string | null;
  isSaving: boolean;
  onManualSave: () => void;
  autoSaveEnabled: boolean;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  lastSaveTime,
  isSaving,
  onManualSave,
  autoSaveEnabled
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [showSaved, setShowSaved] = useState(false);

  // Update time ago display
  useEffect(() => {
    if (!lastSaveTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const saveTime = new Date(lastSaveTime);
      const diffMs = now.getTime() - saveTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds}s ago`);
      } else if (diffMinutes < 60) {
        setTimeAgo(`${diffMinutes}m ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}h ago`);
      } else {
        setTimeAgo(saveTime.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastSaveTime]);

  // Show saved indicator briefly after save
  useEffect(() => {
    if (lastSaveTime && !isSaving) {
      setShowSaved(true);
      const timeout = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [lastSaveTime, isSaving]);

  // Listen for autosave events
  useEffect(() => {
    const handleAutoSave = () => {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    };

    window.addEventListener('autosave', handleAutoSave);
    return () => window.removeEventListener('autosave', handleAutoSave);
  }, []);

  const getStatusIcon = () => {
    if (isSaving) {
      return <Loader className="w-4 h-4 animate-spin text-[#8a8a8a]" />;
    }
    if (showSaved) {
      return <CheckCircle className="w-4 h-4 text-[#3ecf5e]" />;
    }
    if (autoSaveEnabled) {
      return <Save className="w-4 h-4 text-[#5c5c5c]" />;
    }
    return <AlertCircle className="w-4 h-4 text-[#e07856]" />;
  };

  const getStatusText = () => {
    if (isSaving) return 'Saving...';
    if (showSaved) return 'Saved!';
    if (!autoSaveEnabled) return 'Auto-save disabled';
    if (lastSaveTime) return `Last saved ${timeAgo}`;
    return 'Not saved';
  };

  const getStatusColor = () => {
    if (isSaving) return 'text-[#8a8a8a] bg-[#1c1c1c] border-[#2a2a2a]';
    if (showSaved) return 'text-[#3ecf5e] bg-[#3ecf5e]/10 border-[#3ecf5e]/25';
    if (!autoSaveEnabled) return 'text-[#e07856] bg-[#e07856]/08 border-[#2a2a2a]';
    return 'text-[#5c5c5c] bg-[#1c1c1c] border-[#2a2a2a]';
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Indicator */}
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </div>

      <button
        onClick={onManualSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] border border-[#2a2a2a] hover:bg-[#242424] disabled:opacity-50 text-[#e8e8e8] rounded-md transition-colors text-sm"
        title="Save manually"
      >
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">Save</span>
      </button>

      {/* Last Save Time (detailed) */}
      {lastSaveTime && (
        <div className="flex items-center gap-1 text-xs text-[#5c5c5c]">
          <Clock className="w-3 h-3" />
          <span className="hidden md:inline">
            {new Date(lastSaveTime).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default SaveStatusIndicator;