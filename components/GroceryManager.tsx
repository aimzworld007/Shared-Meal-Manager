/**
 * @file GroceryManager.tsx
 * @summary Component for managing grocery expense entries.
 */
import React, { useState } from 'react';
import { GroceryItem } from '../types';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  onAdd: (item: Omit<GroceryItem, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const GroceryManager: React.FC<GroceryManagerProps> = ({ groceries, onAdd, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.trim() && amount) {
      onAdd({
        date,
        item: item.trim(),
        amount: parseFloat(amount),
      });
      setItem('');
      setAmount('');
    }
  };
  
  const sortedGroceries = [...groceries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Manage Groceries</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
        <div className="md:col-span-1">
            <label htmlFor="grocery-date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
                id="grocery-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <div className="md:col-span-2">
            <label htmlFor="grocery-item" className="block text-sm font-medium text-gray-700">Item Description</label>
            <input
                id="grocery-item"
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g., Vegetables, milk"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <div className="md:col-span-1">
             <label htmlFor="grocery-amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
                id="grocery-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <button
          type="submit"
          className="md:col-span-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Grocery
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {sortedGroceries.map((g) => (
                <tr key={g.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(g.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onDelete(g.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
         {groceries.length === 0 && <p className="text-center text-gray-500 py-4">No grocery expenses recorded yet.</p>}
      </div>
    </div>
  );
};
