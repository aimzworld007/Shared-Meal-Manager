/**
 * @file Login.tsx
 * @summary Renders the authentication screen for the application.
 * This component provides an interface for users to sign in, sign up,
 * or request a password reset.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logoDataUri } from '../assets/logo';

type AuthView = 'login' | 'signup' | 'forgot';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [message, setMessage] = useState('');

  const { login, signUp, resetPassword, error, loading, clearError } = useAuth();

  const switchView = (newView: AuthView) => {
    clearError();
    setEmail('');
    setPassword('');
    setMessage('');
    setView(newView);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');
    clearError();
    try {
      if (view === 'login') {
        await login(email, password);
      } else if (view === 'signup') {
        await signUp(email, password);
      } else if (view === 'forgot') {
        await resetPassword(email);
        setMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err) {
      // Error is caught and displayed via the `error` state from useAuth
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const titles = {
    login: 'Account Login',
    signup: 'Create an Account',
    forgot: 'Reset Your Password',
  };

  const descriptions = {
    login: 'Sign in to manage your meal expenses.',
    signup: 'Create a free account to get started.',
    forgot: 'Enter your email to receive a password reset link.',
  };
  
  const buttonText = {
    login: 'Sign In',
    signup: 'Sign Up',
    forgot: 'Send Reset Link',
  };
  
  const isProcessing = loading || formLoading;

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-sm w-full">
        <img src={logoDataUri} alt="Shared Meal Manager Logo" className="w-40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">{titles[view]}</h2>
        <p className="text-gray-600 mt-2 mb-6">
          {descriptions[view]}
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
          {view !== 'forgot' && (
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
          )}
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:bg-indigo-300"
          >
            {isProcessing ? 'Processing...' : buttonText[view]}
          </button>
        </form>
        <div className="mt-6 text-sm">
          {view === 'login' && (
            <div className="flex justify-between">
              <button onClick={() => switchView('forgot')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </button>
              <button onClick={() => switchView('signup')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </button>
            </div>
          )}
           {view === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => switchView('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </button>
            </p>
          )}
           {view === 'forgot' && (
             <p>
              Remember your password?{' '}
              <button onClick={() => switchView('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
