/**
 * @file Modal.tsx
 * @summary A generic, reusable modal component for displaying forms or messages.
 */
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 transform transition-all sm:max-w-lg sm:w-full mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
          <div className="sm:flex sm:items-start">
            <div className="text-center sm:text-left w-full">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight" id="modal-title">
                {title}
              </h3>
              <div className="mt-6">
                {children}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-slate-100 dark:border-slate-800">
          <button type="button" className="mt-3 w-full inline-flex justify-center rounded-full border border-slate-300 dark:border-slate-600 shadow-sm px-6 py-2.5 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all active:scale-[0.98]" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
