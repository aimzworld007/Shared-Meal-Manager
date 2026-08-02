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
  action: 'email' | 'password' | 'delete';
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
  
  const titles = {
      email: 'Confirm to change email',
      password: 'Confirm to change password',
      delete: 'Confirm Account Deletion'
  };
  const messages = {
      email: 'For your security, please enter your current password to confirm this change.',
      password: 'For your security, please enter your current password to confirm this change.',
      delete: 'This is a sensitive action. To proceed with deleting your account, please enter your password.'
  };

  const title = titles[action];
  const message = messages[action];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
        <div>
          <label htmlFor="current-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
          <input
            id="current-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
          />
        </div>
        
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">{error}</p>}
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:active:scale-100 transition-colors active:scale-95">
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReauthModal;