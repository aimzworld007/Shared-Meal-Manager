/**
 * @file Login.tsx
 * @summary Renders the authentication screen for the application.
 * This component provides an interface for users to sign in, sign up,
 * or request a password reset, with an added verification step.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logoUrl as defaultLogoUrl } from '../assets/logo';

// Define the BeforeInstallPromptEvent interface for PWA installation
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type AuthView = 'login' | 'signup' | 'forgot';

interface LoginProps {
  logoUrl?: string;
  installPromptEvent: BeforeInstallPromptEvent | null;
  onInstallClick: () => void;
}

const InstallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ logoUrl, installPromptEvent, onInstallClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [view, setView] = useState<AuthView>('login');
  const [message, setMessage] = useState('');

  // State for the math verification system
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const { login, signUp, resetPassword, error, loading, clearError } = useAuth();
  
  // Generates a new random math problem for verification.
  const generateProblem = () => {
    let n1 = Math.floor(Math.random() * 90) + 10; // Random number between 10-99
    let n2 = Math.floor(Math.random() * 90) + 10;
    const op = Math.random() > 0.5 ? '+' : '-';
    
    // To keep it simple, ensure subtraction doesn't result in a negative number
    if (op === '-' && n1 < n2) {
      [n1, n2] = [n2, n1]; // Swap the numbers
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setVerificationAnswer(''); // Clear user's previous answer
    setVerificationError(null); // Clear any old verification errors
  };
  
  // Generate a problem on the initial render and whenever the view (login/signup) changes.
  useEffect(() => {
    if (view === 'login' || view === 'signup') {
      generateProblem();
    }
  }, [view]);

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
    setVerificationError(null);

    // --- Verification Check for Login and Signup ---
    if (view === 'login' || view === 'signup') {
      const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
      if (parseInt(verificationAnswer, 10) !== correctAnswer) {
        setVerificationError('Incorrect verification answer. Please try again.');
        generateProblem(); // Ask a new question
        setFormLoading(false);
        return; // Stop the submission
      }
    }

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
      // If any auth error occurs, generate a new problem for the user
      if (view === 'login' || view === 'signup') {
        generateProblem();
      }
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center max-w-sm w-full">
        <img src={logoUrl || defaultLogoUrl} alt="Shared Meal Manager Logo" className="w-40 h-40 object-contain mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{titles[view]}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
          {descriptions[view]}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          {view !== 'forgot' && (
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div>
              <label htmlFor="verification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification: What is {num1} {operator} {num2}?
              </label>
              <input
                id="verification"
                type="number"
                value={verificationAnswer}
                onChange={(e) => setVerificationAnswer(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your answer"
              />
            </div>
          )}
          
          {(error || verificationError) && <p className="text-sm text-red-600 text-center">{error || verificationError}</p>}
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
              <button onClick={() => switchView('forgot')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot password?
              </button>
              <button onClick={() => switchView('signup')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign up
              </button>
            </div>
          )}
           {view === 'signup' && (
            <p className="dark:text-gray-300">
              Already have an account?{' '}
              <button onClick={() => switchView('login')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </button>
            </p>
          )}
           {view === 'forgot' && (
             <p className="dark:text-gray-300">
              Remember your password?{' '}
              <button onClick={() => switchView('login')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
      {installPromptEvent && (
         <div className="mt-8 max-w-sm w-full">
             <button onClick={onInstallClick} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                 <InstallIcon />
                 Install App
             </button>
         </div>
      )}
    </div>
  );
};

export default Login;