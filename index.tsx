import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SiteSettingsProvider>
        <App />
      </SiteSettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
