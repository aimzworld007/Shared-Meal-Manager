/**
 * @file App.tsx
 * @summary The root component of the Shared Meal Manager application.
 * It uses the authentication context to conditionally render either the
 * Login page or the main Dashboard, acting as a simple router.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Footer from './components/Footer';
import { logoUrl as defaultLogoUrl } from './assets/logo';

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                return storedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


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
    <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <main className="flex-grow flex flex-col">
            {loading ? (
               <div className="flex-grow flex items-center justify-center">
                 <p className="text-gray-600 dark:text-gray-400">Loading your session...</p>
               </div>
            ) : user ? (
              <Dashboard
                logoUrl={defaultLogoUrl}
              />
            ) : (
              <Login
                logoUrl={defaultLogoUrl}
                installPromptEvent={installPromptEvent}
                onInstallClick={handleInstallClick}
              />
            )}
          </main>
          <Footer />
        </div>
    </ThemeProvider>
  );
};

export default App;