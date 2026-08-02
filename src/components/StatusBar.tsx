import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const StatusBar: React.FC = () => {
  const { settings } = useSettings();
  const isDark = settings.theme === 'dark';
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
    <div className={`fixed bottom-0 left-0 right-0 h-6 flex items-center px-4 border-t z-40 transition-colors ${
      isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-200'
    }`}>
      <div className="flex-1"></div>
      
      <div className="flex items-center">
        <div 
          className={`flex items-center gap-1.5 text-xs transition-opacity duration-300 ${
            showSaved ? 'opacity-100' : 'opacity-0'
          } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          <Check className="w-3 h-3" />
          <span>Saved</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
