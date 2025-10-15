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

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  /** The currently authenticated user object, or null if not logged in. */
  user: User | null;
  /** A boolean indicating if the authentication status is being checked on initial load. */
  loading: boolean;
  /** A function to trigger the sign-in process with email and password. */
  login: (email: string, pass: string) => Promise<void>;
  /** A function to trigger the sign-up process with email and password. */
  signUp: (email: string, pass: string) => Promise<void>;
  /** A function to trigger the sign-out process. */
  logout: () => Promise<void>;
  /** Stores any authentication error messages. */
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides the authentication context to its children components.
 * It manages the user state by subscribing to Firebase's auth state changes
 * and provides login/logout functions.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {JSX.Element} The rendered AuthProvider component.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Subscribes to Firebase's authentication state listener when the component mounts.
   * This ensures the user state is synchronized with Firebase's session management,
   * handling page reloads gracefully.
   * Side Effect: Sets up a listener to Firebase Auth.
   */
  useEffect(() => {
    // onAuthChange from our api service returns the unsubscribe function
    const unsubscribe = api.onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this effect runs only once.

  /**
   * Handles user login by calling the Firebase signIn API.
   * Side Effect: Calls the signIn API.
   */
  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      // The onAuthChange listener will handle setting the user and loading state
      await api.signIn(email, pass);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message);
      throw error; // Re-throw to be caught in component if needed
    }
  };
  
  /**
   * Handles user registration by calling the Firebase signUp API.
   * Side Effect: Calls the signUp API.
   */
  const signUp = async (email: string, pass: string) => {
    setError(null);
    try {
      // The onAuthChange listener will handle setting the user.
      await api.signUp(email, pass);
    } catch (error: any) {
      console.error("Sign up failed:", error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Handles user logout by calling the Firebase signOut API.
   * The user state is cleared via the `onAuthChange` listener.
   * Side Effect: Calls the signOut API.
   */
  const logout = async () => {
    setUser(null);
    await api.signOut();
  };

  const value = { user, loading, login, signUp, logout, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook to access the authentication context.
 * It ensures that the hook is used within an AuthProvider.
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};