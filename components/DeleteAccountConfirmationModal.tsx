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
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-800 dark:text-red-300 rounded-md">
          <p className="font-bold text-lg">Warning: This action is irreversible.</p>
          <p className="mt-1">
            This will permanently delete your account and all associated data, including members, expenses, deposits, and archives.
          </p>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          To confirm, please type <strong className="font-mono bg-gray-200 dark:bg-gray-600 p-1 rounded text-red-600">{CONFIRMATION_TEXT}</strong> into the box below.
        </p>
        <div>
          <label htmlFor="delete-confirm" className="sr-only">Confirmation Text</label>
          <input
            id="delete-confirm"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm dark:bg-gray-700"
          />
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 -mx-6 -mb-4 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
           <button type="button" className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Deleting...' : 'I understand, delete my account'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountConfirmationModal;