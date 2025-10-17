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
        // This function runs once to determine the initial theme.
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                // 1. Check for a saved theme in localStorage.
                const storedTheme = window.localStorage.getItem('theme');
                if (storedTheme === 'light' || storedTheme === 'dark') {
                    return storedTheme;
                }
                // 2. If no saved theme, check the user's OS-level preference.
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
            }
        } catch (error) {
            console.warn("Could not access localStorage for theme. Using default.", error);
        }
        // 3. Default to 'light' theme.
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Apply the 'dark' class to the root <html> element for Tailwind CSS.
        root.classList.toggle('dark', theme === 'dark');
        
        // Persist the current theme to localStorage to remember the user's choice.
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn("Could not save theme to localStorage.", error);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        {/* FIX: Corrected typo in closing tag from Theme-Context.Provider to ThemeContext.Provider */}
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
  const logoToDisplay = defaultLogoUrl;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading your session...</p>
        </div>
      );
    }

    if (user) {
      return <Dashboard logoUrl={logoToDisplay} />;
    }

    return (
      <Login
        logoUrl={logoToDisplay}
        installPromptEvent={installPromptEvent}
        onInstallClick={handleInstallClick}
      />
    );
  };

  return (
    <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <main className="flex-grow flex flex-col">
            {renderContent()}
          </main>
          <Footer />
        </div>
    </ThemeProvider>
  );
};

export default App;
