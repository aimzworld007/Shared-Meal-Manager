/**
 * @file GroceryManager.tsx
 * @summary Component for adding, viewing, and deleting grocery expenses for all members.
 */
import React, { useState } from 'react';
import { GroceryItem, Participant } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import CSVImportModal from './CSVImportModal';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  members: Participant[];
  onAddGrocery: (item: Omit<GroceryItem, 'id'>) => Promise<void>;
  onAddMultipleGroceries: (items: Omit<GroceryItem, 'id' | 'purchaserId'>[], memberId: string) => Promise<void>;
  onDeleteGrocery: (item: GroceryItem) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const GroceryManager: React.FC<GroceryManagerProps> = ({ groceries, members, onAddGrocery, onAddMultipleGroceries, onDeleteGrocery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaserId, setPurchaserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date || !purchaserId || isSubmitting) return;
    setIsSubmitting(true);
    try {
        await onAddGrocery({ name, amount: parseFloat(amount), date, purchaserId });
        setName('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setPurchaserId('');
        setIsModalOpen(false);
    } catch (error) {
        // Error is handled by the hook and displayed on the dashboard
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = (item: GroceryItem) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await onDeleteGrocery(itemToDelete);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleImport = async (items: Omit<GroceryItem, 'id' | 'purchaserId'>[]) => {
    if (purchaserId) {
      await onAddMultipleGroceries(items, purchaserId);
    } else {
      alert("Please select a member to assign the imported groceries to.");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-medium text-gray-900">Grocery Expenses</h3>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Import CSV
            </button>
            <button
              onClick={() => {
                if(members.length > 0) {
                    setPurchaserId(members[0].id)
                    setIsModalOpen(true)
                } else {
                    alert("Please add a member first before adding an expense.");
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Expense
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchased By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groceries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No expenses added yet.</td></tr>
            )}
            {groceries.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.purchaserEmail}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(item.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title="Add New Expense" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label htmlFor="purchaser" className="block text-sm font-medium text-gray-700">Purchased By</label>
              <select id="purchaser" value={purchaserId} onChange={(e) => setPurchaserId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.email}</option>
                ))}
              </select>
           </div>
           <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
             <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Chicken, Rice" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 50.75" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Adding...' : 'Add Expense'}
             </button>
           </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default GroceryManager;