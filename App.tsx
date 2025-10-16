/**
 * @file App.tsx
 * @summary The root component of the Shared Meal Manager application.
 * It uses the authentication context to conditionally render either the
 * Login page or the main Dashboard, acting as a simple router.
 */
import React from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Footer from './components/Footer';

/**
 * The main application component.
 * It checks the user's authentication status and displays the appropriate screen.
 * @returns {JSX.Element} The rendered Login or Dashboard component.
 */
const App: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <main className="flex-grow flex flex-col">
        {loading ? (
           <div className="flex-grow flex items-center justify-center">
             <p className="text-gray-600">Loading your session...</p>
           </div>
        ) : user ? (
          <Dashboard />
        ) : (
          <Login />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
