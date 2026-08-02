import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Sparkles, Code2, Play, MousePointerClick } from 'lucide-react';

interface WelcomeTourModalProps {
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Welcome to GB Coder',
    description: 'The fastest way to prototype and build modern web applications directly in your browser.',
    icon: <Code2 className="w-12 h-12 text-blue-500" />,
    target: null, // Center screen
  },
  {
    title: 'This is your Editor',
    description: 'Write HTML, CSS, and JavaScript. We support TypeScript, JSX, and multi-file projects out of the box.',
    icon: <Code2 className="w-8 h-8 text-indigo-500" />,
    target: 'editor',
  },
  {
    title: 'Live Preview',
    description: 'Your code runs instantly in a secure, sandboxed iframe as you type. No refreshing needed.',
    icon: <Play className="w-8 h-8 text-green-500" />,
    target: 'preview',
  },
  {
    title: 'AI is one click away',
    description: 'Select code and click the wand, or open the AI Chat to generate and fix code instantly.',
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    target: 'ai',
  }
];

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem('gbcoder_onboarded', 'true');
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Focus trap setup
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
    >
      <div 
        className={`bg-surface-raised border border-stroke-subtle rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-stroke-subtle">
          <div className="flex space-x-1">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-accent' : 'w-2 bg-stroke-strong'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleClose}
            className="text-content-muted hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
            aria-label="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6 p-4 rounded-full bg-surface-canvas border border-stroke-subtle shadow-inner">
            {step.icon}
          </div>
          
          <h2 id="tour-modal-title" className="text-2xl font-bold text-content-primary mb-3">
            {step.title}
          </h2>
          
          <p className="text-content-secondary mb-8 leading-relaxed">
            {step.description}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={nextStep}
              className="w-full flex items-center justify-center py-3 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
            >
              {currentStep < TOUR_STEPS.length - 1 ? (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              ) : (
                <>Get Started <MousePointerClick className="w-4 h-4 ml-1" /></>
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-sm text-content-muted hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong rounded-lg"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTourModal;
