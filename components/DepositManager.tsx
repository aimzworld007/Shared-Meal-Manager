/**
 * @file DepositManager.tsx
 * @summary Component for managing member deposit entries.
 */
import React, { useState } from 'react';
import { Deposit, Member } from '../types';

interface DepositManagerProps {
  deposits: Deposit[];
  members: Member[];
  onAdd: (item: Omit<Deposit, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const DepositManager: React.FC<DepositManagerProps> = ({ deposits, members, onAdd, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberId && amount) {
      onAdd({
        date,
        memberId,
        amount: parseFloat(amount),
      });
      setAmount('');
    }
  };

  const sortedDeposits = [...deposits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Manage Deposits</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
        <div>
            <label htmlFor="deposit-date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
                id="deposit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <div>
            <label htmlFor="deposit-member" className="block text-sm font-medium text-gray-700">Member</label>
            <select
                id="deposit-member"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                disabled={members.length === 0}
            >
                <option value="" disabled>Select a member</option>
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
                id="deposit-amount"
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
          disabled={members.length === 0}
          className="md:col-span-3 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          Add Deposit
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {sortedDeposits.map((d) => (
                <tr key={d.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getMemberName(d.memberId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(d.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onDelete(d.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        {deposits.length === 0 && <p className="text-center text-gray-500 py-4">No deposits recorded yet.</p>}
      </div>
    </div>
  );
};
