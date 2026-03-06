import React, { useState, useEffect } from 'react';
import { Mic, MicOff, HelpCircle, X, CheckCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { voiceCommandService } from '../services/voiceCommandService';
import toast from 'react-hot-toast';

interface VoiceCommandPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceCommandPanel: React.FC<VoiceCommandPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [commands, setCommands] = useState(voiceCommandService.getCommands());
  const [stats, setStats] = useState(voiceCommandService.getStats());

  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { action, param } = event.detail;
      toast.success(`Voice command: ${action}${param ? ` (${param})` : ''}`);
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    
    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateStats = () => {
      setStats(voiceCommandService.getStats());
    };

    voiceCommandService.setCommandExecutedCallback(updateStats);
    
    // Update listening status periodically
    const interval = setInterval(() => {
      setIsListening(voiceCommandService.isListeningStatus());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleToggleListening = () => {
    const supported = voiceCommandService.isSupported();
    
    if (!supported) {
      toast.error('Voice commands are not supported in your browser. Try Chrome or Edge.');
      return;
    }

    const newState = voiceCommandService.toggleListening();
    setIsListening(newState);
    
    if (newState) {
      toast.success('Listening... Speak a command');
    } else {
      toast.success('Voice commands disabled');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isListening 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse' 
                : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              {isListening ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Voice Commands
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isListening ? 'Listening... Speak a command' : 'Click microphone to start'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg text-white'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isListening ? 'Stop' : 'Start'} Listening
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 max-h-[60vh] overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Stats */}
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Commands Executed</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                  {stats.commandsExecuted}
                </p>
              </div>
              {stats.lastCommand && (
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Command</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{stats.lastCommand}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Supported Commands */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Available Commands
            </h3>
            <div className="grid gap-3">
              {commands.map((command, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {command.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {command.examples.map((example, exIdx) => (
                          <span
                            key={exIdx}
                            className={`text-xs px-2 py-1 rounded-md ${
                              isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            "{example}"
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Support Notice */}
          {!voiceCommandService.isSupported() && (
            <div className={`mt-6 p-4 rounded-xl border ${
              isDark 
                ? 'bg-yellow-900/20 border-yellow-700 text-yellow-400' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <p className="text-sm">
                ⚠️ Voice commands are not supported in your browser. Please use Google Chrome, Microsoft Edge, or another Chromium-based browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandPanel;
