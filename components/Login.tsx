/**
 * @file Login.tsx
 * @summary Renders the login/signup screen for the application.
 * This component provides an interface for users to sign in or create an account
 * using their email and password.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * A presentation component for the login and registration page.
 * It features a form for email/password and allows switching between
 * "Sign In" and "Sign Up" modes.
 * @returns {JSX.Element} The rendered login page component.
 */
const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { login, signUp, error, loading } = useAuth();

  /**
   * Handles the form submission for both login and signup.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signUp(email, password);
      }
      // The onAuthChange listener in useAuth will handle redirecting to dashboard.
    } catch (err) {
      // Error is caught and displayed via the `error` state from useAuth
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shared Meal Manager</h1>
        <p className="text-gray-600 mb-6">
          {isLoginView ? 'Sign in to your account.' : 'Create an account to get started.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error.replace('Firebase: ', '')}</p>}

          <button
            type="submit"
            disabled={loading || formLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:bg-indigo-300"
          >
            {loading || formLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;