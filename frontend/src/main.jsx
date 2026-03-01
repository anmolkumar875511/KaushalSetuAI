import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ResumeProvider } from './context/ResumeContext.jsx';
import AxiosInterceptor from './AxiosInterceptor.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <ResumeProvider>
                <AxiosInterceptor>
                    <App />
                </AxiosInterceptor>
            </ResumeProvider>
        </AuthProvider>
    </BrowserRouter>
);
