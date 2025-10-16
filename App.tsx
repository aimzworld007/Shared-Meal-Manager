/**
 * @file App.tsx
 * @summary The root component of the Shared Meal Manager application.
 * It uses the authentication context to conditionally render either the
 * Login page or the main Dashboard, acting as a simple router.
 */
import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useSiteSettings } from './hooks/useSiteSettings';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Footer from './components/Footer';
import DynamicMetadata from './components/DynamicMetadata';

/**
 * The main application component.
 * It checks the user's authentication status and displays the appropriate screen.
 * @returns {JSX.Element} The rendered Login or Dashboard component.
 */
const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const loading = authLoading || settingsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <DynamicMetadata />
      <main className="flex-grow flex flex-col">
        {loading ? (
           <div className="flex-grow flex items-center justify-center">
             <p className="text-gray-600">Loading your session...</p>
           </div>
        ) : user ? (
          <Dashboard logoUrl={settings?.logoUrl} />
        ) : (
          <Login logoUrl={settings?.logoUrl} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
