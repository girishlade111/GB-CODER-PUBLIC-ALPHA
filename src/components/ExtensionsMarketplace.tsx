import React, { useState } from 'react';
import { X, Search, Puzzle, Sparkles, Package, Clock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ExtensionsMarketplaceProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExtensionsMarketplace: React.FC<ExtensionsMarketplaceProps> = ({
    isOpen,
    onClose,
}) => {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-full md:w-[400px] border-l shadow-2xl z-50 flex flex-col animate-slideIn ${isDark ? 'bg-matte-black border-gray-800' : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'bg-matte-black border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Puzzle className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className={`font-sans text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Extensions Marketplace
                                </h2>
                                {/* Coming Soon Badge */}
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${isDark
                                        ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    }`}>
                                    <Clock className="w-3 h-3" />
                                    Coming Soon
                                </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Extend your coding experience
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                    <div className={`relative flex items-center rounded-lg border ${isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-gray-50 border-gray-300'
                        }`}>
                        <Search className={`absolute left-3 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                        <input
                            type="text"
                            placeholder="Search extensions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors ${isDark
                                    ? 'bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700'
                                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white'
                                }`}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-matte-black' : 'bg-white'
                    }`}>
                    {/* Coming Soon Preview Section */}
                    <div className="px-6 py-8">
                        <div className={`text-center py-12 px-6 rounded-xl border-2 border-dashed ${isDark
                                ? 'bg-gray-900/50 border-gray-700'
                                : 'bg-gray-50 border-gray-300'
                            }`}>
                            {/* Icon */}
                            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'
                                }`}>
                                <Package className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`} />
                            </div>

                            {/* Title */}
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                Extensions Coming Soon!
                            </h3>

                            {/* Description */}
                            <p className={`text-sm mb-6 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                We're building an amazing extension marketplace to enhance your coding experience with powerful tools and integrations.
                            </p>

                            {/* Feature Preview */}
                            <div className="space-y-3 max-w-sm mx-auto">
                                <div className={`flex items-start gap-3 p-3 rounded-lg text-left ${isDark ? 'bg-gray-800/50' : 'bg-white'
                                    }`}>
                                    <Sparkles className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'
                                        }`} />
                                    <div>
                                        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            AI-Powered Extensions
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            Smart tools to boost productivity
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-start gap-3 p-3 rounded-lg text-left ${isDark ? 'bg-gray-800/50' : 'bg-white'
                                    }`}>
                                    <Package className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'
                                        }`} />
                                    <div>
                                        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            Framework Integrations
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            React, Vue, Angular and more
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-start gap-3 p-3 rounded-lg text-left ${isDark ? 'bg-gray-800/50' : 'bg-white'
                                    }`}>
                                    <Puzzle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                    <div>
                                        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            Custom Themes
                                        </h4>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            Personalize your coding environment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Tuned Message */}
                            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'
                                }`}>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    🚀 Stay tuned for updates!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
};

export default ExtensionsMarketplace;
