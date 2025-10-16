/**
 * @file RestoreConfirmationModal.tsx
 * @summary A modal to confirm a destructive data restore action.
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface RestoreConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CONFIRMATION_TEXT = "RESTORE";

const RestoreConfirmationModal: React.FC<RestoreConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');
  const isConfirmed = inputText === CONFIRMATION_TEXT;

  useEffect(() => {
    // Reset input text when modal is opened or closed to ensure clean state
    if (!isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Data Restore">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-md">
          <p className="font-bold text-lg">Warning: This action is irreversible.</p>
          <p className="mt-1">
            Restoring from a backup will completely <strong>delete all current data</strong> 
            (members, expenses, deposits, and settings) and replace it with the data from the backup file.
          </p>
        </div>
        <p className="text-sm text-gray-700">
          To confirm, please type <strong className="font-mono bg-gray-200 p-1 rounded text-red-600">{CONFIRMATION_TEXT}</strong> into the box below.
        </p>
        <div>
          <label htmlFor="restore-confirm" className="sr-only">Confirmation Text</label>
          <input
            id="restore-confirm"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoComplete="off"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        <div className="bg-gray-50 -mx-6 -mb-4 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
           <button type="button" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            Confirm Restore
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RestoreConfirmationModal;
