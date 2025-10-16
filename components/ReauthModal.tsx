/**
 * @file ReauthModal.tsx
 * @summary A modal for re-authenticating the user with their password.
 */
import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../hooks/useAuth';

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: 'email' | 'password';
  error: string | null;
}

const ReauthModal: React.FC<ReauthModalProps> = ({ isOpen, onClose, onSuccess, action, error }) => {
  const { reauthenticate } = useAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reauthenticate(password);
      onSuccess(); // If re-authentication is successful, call the success callback
    } catch (err) {
      // Error is handled by the auth context and passed as a prop
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const title = `Confirm to change ${action}`;
  const message = `For your security, please enter your current password to confirm this change.`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div>
          <label htmlFor="current-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
          <input
            id="current-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        
        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReauthModal;