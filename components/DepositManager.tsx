
/**
 * @file DepositManager.tsx
 * @summary A component for managing financial deposits made by participants.
 */
import React, { useState } from 'react';
import { Deposit, Participant } from '../types';

/**
 * Props for the DepositManager component.
 */
interface DepositManagerProps {
  /** The list of all deposits. */
  deposits: Deposit[];
  /** The list of all participants, used for the dropdown selector. */
  participants: Participant[];
  /** Callback function to add a new deposit. */
  onAddDeposit: (item: Omit<Deposit, 'id'>) => void;
  /** Callback function to delete a deposit. */
  onDeleteDeposit: (id: string) => void;
}

/**
 * Renders the deposit management section, including a list and an add form.
 * @param {DepositManagerProps} props - The component props.
 * @returns {JSX.Element} The rendered deposit manager component.
 */
const DepositManager: React.FC<DepositManagerProps> = ({ deposits, participants, onAddDeposit, onDeleteDeposit }) => {
  const [participantId, setParticipantId] = useState('');
  const [amount, setAmount] = useState('');

  /**
   * Handles the form submission for adding a new deposit.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (participantId && !isNaN(parsedAmount) && parsedAmount > 0) {
      onAddDeposit({
        date: new Date().toISOString().split('T')[0], // Use current date
        participantId,
        amount: parsedAmount,
      });
      setParticipantId('');
      setAmount('');
    }
  };
  
  /**
   * Finds a participant's name by their ID.
   * A helper function to display names in the list instead of just IDs.
   * @param {string} id - The ID of the participant.
   * @returns {string} The name of the participant or 'Unknown'.
   */
  const getParticipantName = (id: string) => {
      return participants.find(p => p.id === id)?.name || 'Unknown';
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Deposits</h3>
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <select
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Participant</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Deposit</button>
      </form>
      <ul className="divide-y divide-gray-200">
        {deposits.map(d => (
          <li key={d.id} className="py-2 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-800">{getParticipantName(d.participantId)}</p>
              <p className="text-xs text-gray-500">{d.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">${d.amount.toFixed(2)}</p>
              <button onClick={() => onDeleteDeposit(d.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepositManager;
