
/**
 * @file Login.tsx
 * @summary Renders the login screen for the application.
 * This component provides a simple interface for users to sign in.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * A presentation component for the login page.
 * It features a welcome message and a login button that triggers the
 * authentication process from the useAuth hook.
 * @returns {JSX.Element} The rendered login page component.
 */
const Login: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shared Meal Manager</h1>
        <p className="text-gray-600 mb-6">Welcome! Please sign in to manage your group's expenses.</p>
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:bg-indigo-300"
        >
          {loading ? 'Signing In...' : 'Sign In with Mock User'}
        </button>
      </div>
    </div>
  );
};

export default Login;
