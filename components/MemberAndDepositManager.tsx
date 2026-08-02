/**
 * @file MemberAndDepositManager.tsx
 * @summary A unified component for adding members and managing all deposits.
 */
import React, { useState } from 'react';
import { Deposit } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.287.468-1.173 4.249 4.35-1.14z" />
    </svg>
);

const EditIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DeleteIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface MemberAndDepositManagerProps {
  deposits: Deposit[];
  onEditDeposit: (deposit: Deposit) => void;
  onDeleteDeposit: (item: Deposit) => Promise<void>;
}

const MemberAndDepositManager: React.FC<MemberAndDepositManagerProps> = ({ deposits, onEditDeposit, onDeleteDeposit }) => {
  const { currency } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Deposit | null>(null);

  const handleDeleteClick = (item: Deposit) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await onDeleteDeposit(itemToDelete);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleShareWhatsApp = (item: Deposit) => {
    const dateFormatted = new Date(item.date).toLocaleDateString();
    const message = `*Deposit Recorded*\n\n` +
                    `*Member:* ${item.userName}\n` +
                    `*Amount:* ${formatCurrency(item.amount, currency)}\n` +
                    `*Date:* ${dateFormatted}\n\n` +
                    `Thank you for your contribution!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Deposit History</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th scope="col" className="relative px-4 sm:px-8 py-4"><span className="sr-only">Actions</span></th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
                {deposits.length === 0 && (
                <tr><td colSpan={4} className="px-4 sm:px-8 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No deposits added yet.</td></tr>
                )}
                {deposits.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.userName}</td>
                    <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.amount, currency)}</td>
                    <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleShareWhatsApp(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors active:scale-95" title="Share on WhatsApp">
                                <WhatsAppIcon />
                            </button>
                            <button onClick={() => onEditDeposit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors active:scale-95" title="Edit or Transfer Deposit">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteClick(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900/30 transition-colors active:scale-95" title="Delete Deposit">
                                <DeleteIcon />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Deposit"
        message="Are you sure you want to delete this deposit? This action cannot be undone."
      />
    </div>
  );
};

export default MemberAndDepositManager;