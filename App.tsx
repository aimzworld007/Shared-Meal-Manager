/**
 * @file App.tsx
 * @summary The root component of the Shared Meal Manager application.
 * It uses the authentication context to conditionally render either the
 * Login page or the main Dashboard, acting as a simple router.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Footer from './components/Footer';
import { logoUrl as defaultLogoUrl } from './assets/logo';

// Define the BeforeInstallPromptEvent interface for PWA installation
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * The main application component.
 * It checks the user's authentication status and displays the appropriate screen.
 * @returns {JSX.Element} The rendered Login or Dashboard component.
 */
const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Register service worker for offline capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
          .catch(err => console.log('ServiceWorker registration failed: ', err));
      });
    }

    // Listen for the browser's install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setInstallPromptEvent(e as BeforeInstallPromptEvent); // Stash the event so it can be triggered later.
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPromptEvent) return;

    // Show the install prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // We can only use the prompt once, so clear it.
      setInstallPromptEvent(null);
    });
  };

  const loading = authLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <main className="flex-grow flex flex-col">
        {loading ? (
           <div className="flex-grow flex items-center justify-center">
             <p className="text-gray-600">Loading your session...</p>
           </div>
        ) : user ? (
          <Dashboard
            logoUrl={defaultLogoUrl}
            installPromptEvent={installPromptEvent}
            onInstallClick={handleInstallClick}
          />
        ) : (
          <Login logoUrl={defaultLogoUrl} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
