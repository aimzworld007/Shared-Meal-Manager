/**
 * @file DepositManager.tsx
 * @summary Component for adding, viewing, and deleting deposits.
 */
import React, { useState } from 'react';
import { Deposit } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface DepositManagerProps {
  deposits: Deposit[];
  onAddDeposit: (item: { amount: number; date: string }) => Promise<void>;
  onDeleteDeposit: (id: string) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const DepositManager: React.FC<DepositManagerProps> = ({ deposits, onAddDeposit, onDeleteDeposit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || isSubmitting) return;
    setIsSubmitting(true);
    try {
        await onAddDeposit({ amount: parseFloat(amount), date });
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(false);
    } catch(error) {
        // Error is handled by the hook
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await onDeleteDeposit(itemToDelete);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Deposits</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add Deposit
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {deposits.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No deposits added yet.</td></tr>
            )}
            {deposits.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-800">{formatCurrency(item.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button onClick={() => handleDeleteClick(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <Modal title="Add New Deposit" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="deposit_date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="deposit_amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {isSubmitting ? 'Adding...' : 'Add Deposit'}
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

export default DepositManager;
