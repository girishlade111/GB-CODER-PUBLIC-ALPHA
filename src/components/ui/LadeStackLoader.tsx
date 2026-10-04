import React from 'react';

interface LadeStackLoaderProps {
    message?: string;
    className?: string;
}

const LadeStackLoader: React.FC<LadeStackLoaderProps> = ({
    message = 'Initializing Lade Stack...',
    className = ''
}) => {
    return (
        <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 ${className}`}>
            <div className="flex flex-col items-center justify-center space-y-6">
                {/* Lade Stack Logo */}
                <div className="relative">
                    {/* Animated Square */}
                    <div className="absolute -right-8 -top-4 w-12 h-12 border-2 border-white transform rotate-45 animate-pulse"></div>

                    {/* Main Text */}
                    <div className="flex items-center gap-3">
                        <h1 className="font-sans text-5xl md:text-6xl font-medium text-white tracking-wider animate-fade-in">
                            LADE
                        </h1>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <h1 className="font-sans text-5xl md:text-6xl font-medium text-white tracking-wider animate-fade-in">
                            STACK
                        </h1>
                    </div>

                    {/* Underline */}
                    <div className="h-0.5 bg-white mt-2 animate-expand"></div>
                </div>

                {/* Loading Message */}
                <div className="flex flex-col items-center space-y-3">
                    <p className="text-gray-400 text-sm md:text-base tracking-wide animate-fade-in-delay">
                        {message}
                    </p>

                    {/* Loading Dots */}
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          0%, 30% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 1.2s ease-out forwards;
        }

        .animate-expand {
          animation: expand 0.8s ease-out 0.3s forwards;
          width: 0;
        }
      `}</style>
        </div>
    );
};

export default LadeStackLoader;
