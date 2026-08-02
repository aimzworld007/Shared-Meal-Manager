/**
 * @file Login.tsx
 * @summary Renders the authentication screen for the application.
 * This component provides an interface for users to sign in, sign up,
 * or request a password reset, with an added verification step.
 */
// FIX: Import useState and useEffect from React to resolve "Cannot find name" errors.
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
  const [challenge, setChallenge] = useState<{ problem: string; answer: number }>({ problem: '', answer: 0 });
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const { login, signUp, resetPassword, error, loading, clearError } = useAuth();

  // Generates a new random math problem for verification.
  const generateChallenge = () => {
    const isAddition = Math.random() > 0.5;

    let num1, num2, problem, answer;

    if (isAddition) {
        // Keep sum under 20
        num1 = Math.floor(Math.random() * 10) + 1; // 1-10
        num2 = Math.floor(Math.random() * (20 - num1)) + 1; // Ensures sum <= 20
        problem = `${num1} + ${num2}`;
        answer = num1 + num2;
    } else {
        // Ensure result is positive
        const n1 = Math.floor(Math.random() * 20) + 1; // 1-20
        const n2 = Math.floor(Math.random() * n1) + 1;   // 1 to n1, ensures positive result
        problem = `${n1} - ${n2}`;
        answer = n1 - n2;
    }

    setChallenge({ problem, answer });
    setVerificationInput(''); // Clear user's previous answer
    setVerificationError(null); // Clear any old verification errors
  };
  
  // Generate a challenge on the initial render and whenever the view (login/signup) changes.
  useEffect(() => {
    if (view === 'login' || view === 'signup') {
      generateChallenge();
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
      if (parseInt(verificationInput, 10) !== challenge.answer) {
        setVerificationError('Incorrect answer. Please try again.');
        generateChallenge(); // Ask a new question
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
        generateChallenge();
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 text-center max-w-sm w-full transition-all">
        <img src={logoUrl || defaultLogoUrl} alt="Shared Meal Manager Logo" className="w-40 h-40 object-contain mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{titles[view]}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 mb-8 text-sm">
          {descriptions[view]}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-4 py-3 bg-slate-100 border-transparent rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent sm:text-sm dark:bg-slate-800 dark:text-white transition-all"
              placeholder="you@example.com"
            />
          </div>
          {view !== 'forgot' && (
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full px-4 py-3 bg-slate-100 border-transparent rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent sm:text-sm dark:bg-slate-800 dark:text-white transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div>
              <label htmlFor="verification" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Verification: What is...
              </label>
              <p className="mt-1 text-center font-mono text-lg py-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl text-indigo-700 dark:text-indigo-300 select-none border border-indigo-100 dark:border-indigo-800/50">
                {challenge.problem}
              </p>
              <input
                id="verification"
                type="number"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                required
                className="mt-3 block w-full px-4 py-3 bg-slate-100 border-transparent rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent sm:text-sm dark:bg-slate-800 dark:text-white transition-all"
                placeholder="Your answer"
                autoComplete="off"
              />
            </div>
          )}
          
          {(error || verificationError) && <p className="text-sm text-red-500 text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error || verificationError}</p>}
          {message && <p className="text-sm text-emerald-600 text-center font-medium bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">{message}</p>}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white font-medium py-3.5 px-4 rounded-full shadow-md hover:shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-2"
          >
            {isProcessing ? 'Processing...' : buttonText[view]}
          </button>
        </form>
        <div className="mt-8 text-sm font-medium">
          {view === 'login' && (
            <div className="flex justify-between">
              <button type="button" onClick={() => switchView('forgot')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
              <button type="button" onClick={() => switchView('signup')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                Create account
              </button>
            </div>
          )}
           {view === 'signup' && (
            <p className="dark:text-slate-400 text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => switchView('login')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-1">
                Sign in
              </button>
            </p>
          )}
           {view === 'forgot' && (
             <p className="dark:text-slate-400 text-slate-500">
              Remember your password?{' '}
              <button type="button" onClick={() => switchView('login')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-1">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
      {installPromptEvent && (
         <div className="mt-8 max-w-sm w-full">
             <button onClick={onInstallClick} className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:border-slate-700 transition-all active:scale-[0.98]">
                 <InstallIcon />
                 Install App to Home Screen
             </button>
         </div>
      )}
    </div>
  );
};

export default Login;