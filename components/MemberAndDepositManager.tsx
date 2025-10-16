/**
 * @file MemberAndDepositManager.tsx
 * @summary A unified component for adding members and managing all deposits.
 */
import React, { useState } from 'react';
import { Deposit, Participant } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface MemberAndDepositManagerProps {
  deposits: Deposit[];
  members: Participant[];
  onAddDeposit: (item: Omit<Deposit, 'id'>) => Promise<void>;
  onDeleteDeposit: (item: Deposit) => Promise<void>;
  onUpdateDeposit: (depositId: string, data: Partial<Omit<Deposit, 'id'>>) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.287.468-1.173 4.249 4.35-1.14z" />
    </svg>
);

const MemberAndDepositManager: React.FC<MemberAndDepositManagerProps> = ({ deposits, members, onAddDeposit, onDeleteDeposit, onUpdateDeposit }) => {
  // --- Deposit state ---
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserIdForDeposit, setSelectedUserIdForDeposit] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // --- Deletion state ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Deposit | null>(null);

  // --- Deposit Handlers ---
  const openAddDepositModal = () => {
    if (members.length === 0) {
        alert("Please add a member in Settings before adding a deposit.");
        return;
    }
    setEditingDeposit(null);
    setSelectedUserIdForDeposit(members[0].id);
    setDepositAmount('');
    setDepositDate(new Date().toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const openEditDepositModal = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setSelectedUserIdForDeposit(deposit.userId);
    setDepositAmount(String(deposit.amount));
    setDepositDate(new Date(deposit.date).toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setEditingDeposit(null);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositDate || !selectedUserIdForDeposit || isSubmittingDeposit) return;
    setIsSubmittingDeposit(true);
    
    const depositData = {
      amount: parseFloat(depositAmount),
      date: depositDate,
      userId: selectedUserIdForDeposit,
    };

    try {
      if (editingDeposit) {
        await onUpdateDeposit(editingDeposit.id, depositData);
      } else {
        await onAddDeposit(depositData);
      }
      closeDepositModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

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
                    `*Amount:* ${formatCurrency(item.amount)}\n` +
                    `*Date:* ${dateFormatted}\n\n` +
                    `Thank you for your contribution!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Deposit History</h3>
            <button onClick={openAddDepositModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                Add Deposit
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-100">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {deposits.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No deposits added yet.</td></tr>
                )}
                {deposits.map((item) => (
                <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-800">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                        <button onClick={() => handleShareWhatsApp(item)} className="text-green-600 hover:text-green-800" title="Share on WhatsApp">
                        <WhatsAppIcon />
                        </button>
                    <button onClick={() => openEditDepositModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit / Transfer</button>
                    <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

      {/* Add/Edit Deposit Modal */}
      <Modal title={editingDeposit ? `Edit or Transfer Deposit` : `Add Deposit`} isOpen={isDepositModalOpen} onClose={closeDepositModal}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label htmlFor="deposit_member" className="block text-sm font-medium text-gray-700">Member</label>
              <select
                id="deposit_member"
                value={selectedUserIdForDeposit}
                onChange={(e) => setSelectedUserIdForDeposit(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="deposit_date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="deposit_amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmittingDeposit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {isSubmittingDeposit ? 'Saving...' : (editingDeposit ? 'Save Changes' : 'Add Deposit')}
             </button>
           </div>
        </form>
      </Modal>

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