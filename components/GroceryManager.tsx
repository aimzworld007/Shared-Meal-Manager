/**
 * @file GroceryManager.tsx
 * @summary Component for managing grocery expense entries.
 */
import React, { useState } from 'react';
import { GroceryItem } from '../types';
import Modal from './Modal';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  addGrocery: (item: Omit<GroceryItem, 'id'>) => Promise<void>;
  deleteGrocery: (id: string) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

export const GroceryManager: React.FC<GroceryManagerProps> = ({ groceries, addGrocery, deleteGrocery }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ date: new Date().toISOString().split('T')[0], item: '', amount: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(newItem.amount);
        if (!newItem.date || !newItem.item.trim() || isNaN(amount) || amount <= 0) {
            alert('Please fill out all fields with valid values.');
            return;
        }
        setIsSubmitting(true);
        await addGrocery({ ...newItem, amount });
        setIsSubmitting(false);
        setNewItem({ date: new Date().toISOString().split('T')[0], item: '', amount: '' });
        setIsModalOpen(false);
    };

    return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Grocery Expenses</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm">
          Add Expense
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {groceries.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.item}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
            <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                <button onClick={() => deleteGrocery(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {groceries.length === 0 && <p className="text-center text-gray-500 mt-4">No expenses logged yet.</p>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Grocery Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" name="date" value={newItem.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item Description</label>
            <input type="text" id="item" name="item" value={newItem.item} onChange={handleInputChange} required placeholder="e.g., Weekly Groceries" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" id="amount" name="amount" value={newItem.amount} onChange={handleInputChange} required min="0.01" step="0.01" placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="text-right">
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
