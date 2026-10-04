import { RefreshCw } from 'lucide-react';

const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center">
            <RefreshCw className="w-8 h-8 text-content-on-dark-soft animate-spin mx-auto mb-3" />
            <p className="text-content-on-dark-soft text-sm">{message}</p>
        </div>
    </div>
);

export default LoadingFallback;
