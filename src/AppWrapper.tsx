import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { AuthProvider } from './features/auth/AuthContext';

const AppWrapper: React.FC = () => {
    return (
        <AuthProvider>
            <App />
            <Analytics />
        </AuthProvider>
    );
};

export default AppWrapper;
