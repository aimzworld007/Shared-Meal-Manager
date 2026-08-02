/**
 * @file DeleteAccountConfirmationModal.tsx
 * @summary A modal to confirm a permanent account deletion action.
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface DeleteAccountConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

const DeleteAccountConfirmationModal: React.FC<DeleteAccountConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isConfirmed = inputText === CONFIRMATION_TEXT;

  useEffect(() => {
    // Reset input text when modal is opened or closed to ensure clean state
    if (!isOpen) {
      setInputText('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (isConfirmed) {
      setIsSubmitting(true);
      try {
        await onConfirm();
      } finally {
        // The modal will be closed by the parent component on success
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Are you absolutely sure?">
      <div className="space-y-4">
        <div className="p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 rounded-2xl">
          <p className="font-bold text-lg tracking-tight">Warning: This action is irreversible.</p>
          <p className="mt-1 text-sm font-medium">
            This will permanently delete your account and all associated data, including members, expenses, deposits, and archives.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-400">
          To confirm, please type <strong className="font-mono bg-slate-200 dark:bg-slate-700/50 p-1 rounded-md text-red-600 dark:text-red-400">{CONFIRMATION_TEXT}</strong> into the box below.
        </p>
        <div>
          <label htmlFor="delete-confirm" className="sr-only">Confirmation Text</label>
          <input
            id="delete-confirm"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoComplete="off"
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
          />
        </div>
        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isSubmitting}
            className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:active:scale-100 transition-colors active:scale-95 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Deleting...' : 'I understand, delete my account'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountConfirmationModal;