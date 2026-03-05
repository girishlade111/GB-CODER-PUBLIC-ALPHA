import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

const AppWrapper: React.FC = () => {
    return (
        <>
            <App />
            <Analytics />
        </>
    );
};

export default AppWrapper;
