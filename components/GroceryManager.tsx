
/**
 * @file GroceryManager.tsx
 * @summary A component for managing grocery expenses.
 * It displays a list of grocery purchases and provides a form to add new entries.
 */
import React, { useState } from 'react';
import { GroceryItem } from '../types';

/**
 * Props for the GroceryManager component.
 */
interface GroceryManagerProps {
  /** The current list of grocery items. */
  groceries: GroceryItem[];
  /** Callback function to add a new grocery item. */
  onAddGrocery: (item: Omit<GroceryItem, 'id'>) => void;
  /** Callback function to delete a grocery item. */
  onDeleteGrocery: (id: string) => void;
}

/**
 * Renders the grocery management section, including a list and an add form.
 * @param {GroceryManagerProps} props - The component props.
 * @returns {JSX.Element} The rendered grocery manager component.
 */
const GroceryManager: React.FC<GroceryManagerProps> = ({ groceries, onAddGrocery, onDeleteGrocery }) => {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');

  /**
   * Handles the form submission for adding a new grocery expense.
   * Validates input, calls the onAddGrocery prop, and resets the form fields.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (item.trim() && !isNaN(parsedAmount) && parsedAmount > 0) {
      onAddGrocery({
        date: new Date().toISOString().split('T')[0], // Use current date
        item: item.trim(),
        amount: parsedAmount,
      });
      setItem('');
      setAmount('');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Groceries</h3>
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Item description"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Expense</button>
      </form>
      <ul className="divide-y divide-gray-200">
        {groceries.map(g => (
          <li key={g.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-800">{g.item}</p>
              <p className="text-xs text-gray-500">{g.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">${g.amount.toFixed(2)}</p>
              <button onClick={() => onDeleteGrocery(g.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryManager;
