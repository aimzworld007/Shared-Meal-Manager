/**
 * @file useAuth.tsx
 * @summary Provides authentication context and hooks for the application.
 * This file encapsulates the logic for user sign-in, sign-up, sign-out, and managing
 * the current user's state using Firebase Authentication. It makes the auth state
 * available to all components wrapped within the AuthProvider.
 */
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

const SUPER_ADMIN_EMAIL = 'aimctgbd@gmail.com';

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthErrorMessage = (errorCode: string | undefined): string => {
  switch (errorCode) {
    case 'auth/invalid-email': return 'The email address is not valid.';
    case 'auth/user-disabled': return 'This user account has been disabled.';
    case 'auth/user-not-found': return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials': return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use': return 'This email address is already in use by another account.';
    case 'auth/weak-password': return 'The password is too weak. Please use a stronger password.';
    case 'auth/requires-recent-login': return 'This action is sensitive and requires recent authentication. Please log out and log back in to continue.';
    default: return 'An unexpected authentication error occurred. Please try again.';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = api.onAuthChange((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isAdmin = firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, isAdmin });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleError = (err: any) => {
    console.error("Auth Error:", err);
    setError(getAuthErrorMessage(err.code));
    throw err;
  };
  
  const clearError = () => setError(null);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      await api.signIn(email, pass);
    } catch (err) {
      handleError(err);
    }
  };
  
  const signUp = async (email: string, pass: string) => {
    setError(null);
    try {
      await api.signUp(email, pass);
    } catch (err) {
      handleError(err);
    }
  };

  const logout = async () => {
    setUser(null);
    await api.signOut();
  };
  
  const resetPassword = async (email: string) => {
      setError(null);
      try {
          await api.sendPasswordResetEmail(email);
      } catch (err) {
          handleError(err);
      }
  };

  const reauthenticate = async (password: string) => {
    setError(null);
    try {
      await api.reauthenticateUser(password);
    } catch(err) {
      handleError(err);
    }
  };

  const changeEmail = async (newEmail: string) => {
    setError(null);
    try {
      await api.changeUserEmail(newEmail);
      // Manually update user state since onAuthChange might not fire immediately
      if(user) {
        const isAdmin = newEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        setUser({...user, email: newEmail, isAdmin});
      }
    } catch(err) {
      handleError(err);
    }
  };
  
  const changePassword = async (newPassword: string) => {
     setError(null);
    try {
      await api.changeUserPassword(newPassword);
    } catch(err) {
      handleError(err);
    }
  };
  
  const deleteAccount = async () => {
    setError(null);
    try {
      await api.deleteUserAccount();
      // onAuthChange listener will automatically set user to null, triggering logout.
    } catch (err) {
      handleError(err);
    }
  };

  const value = { user, loading, login, signUp, logout, resetPassword, reauthenticate, changeEmail, changePassword, deleteAccount, error, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};