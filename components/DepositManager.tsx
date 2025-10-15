/**
 * @file DepositManager.tsx
 * @summary Component for managing member deposits.
 */
import React, { useState, useEffect } from 'react';
import { Deposit, Member } from '../types';
import Modal from './Modal';

interface DepositManagerProps {
  deposits: Deposit[];
  members: Member[];
  addDeposit: (item: Omit<Deposit, 'id'>) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

export const DepositManager: React.FC<DepositManagerProps> = ({ deposits, members, addDeposit, deleteDeposit }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ date: new Date().toISOString().split('T')[0], memberId: '', amount: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Set default member when modal opens or members list changes
        if (members.length > 0 && !newItem.memberId) {
            setNewItem(prev => ({ ...prev, memberId: members[0].id }));
        }
    }, [members, newItem.memberId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(newItem.amount);
        if (!newItem.date || !newItem.memberId || isNaN(amount) || amount <= 0) {
            alert('Please fill out all fields with valid values.');
            return;
        }
        setIsSubmitting(true);
        await addDeposit({ ...newItem, amount });
        setIsSubmitting(false);
        setNewItem({ date: new Date().toISOString().split('T')[0], memberId: members[0]?.id || '', amount: '' });
        setIsModalOpen(false);
    };

    const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown Member';

    return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Deposits</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50" disabled={members.length === 0}>
          Add Deposit
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {deposits.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{getMemberName(item.memberId)}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
            <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                <button onClick={() => deleteDeposit(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {deposits.length === 0 && <p className="text-center text-gray-500 mt-4">No deposits logged yet.</p>}
      {members.length === 0 && <p className="text-center text-gray-500 mt-4">Add a member before you can add a deposit.</p>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Deposit">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" name="date" value={newItem.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Member</label>
            <select id="memberId" name="memberId" value={newItem.memberId} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" id="amount" name="amount" value={newItem.amount} onChange={handleInputChange} required min="0.01" step="0.01" placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="text-right">
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
              {isSubmitting ? 'Adding...' : 'Add Deposit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
