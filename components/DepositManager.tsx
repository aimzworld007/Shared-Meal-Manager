/**
 * @file DepositManager.tsx
 * @summary A component for managing member deposit entries.
 */
import React, { useState } from 'react';
import { Deposit, Member } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface DepositManagerProps {
  deposits: Deposit[];
  members: Member[];
  addDeposit: (item: Omit<Deposit, 'id'>) => void;
  updateDeposit: (id: string, item: Omit<Deposit, 'id'>) => void;
  deleteDeposit: (id: string) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const formatDateForInput = (dateString: string) => {
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch(e) {
        return '';
    }
}

export const DepositManager: React.FC<DepositManagerProps> = ({ deposits, members, addDeposit, updateDeposit, deleteDeposit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Deposit | null>(null);
  const [formState, setFormState] = useState({ memberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [itemToDelete, setItemToDelete] = useState<Deposit | null>(null);

  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Unknown Member';

  const openAddModal = () => {
    setCurrentItem(null);
    setFormState({ memberId: members[0]?.id || '', amount: '', date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Deposit) => {
    setCurrentItem(item);
    setFormState({ memberId: item.memberId, amount: item.amount.toString(), date: formatDateForInput(item.date) });
    setIsModalOpen(true);
  };
  
  const openConfirmModal = (item: Deposit) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeposit = {
      memberId: formState.memberId,
      amount: parseFloat(formState.amount),
      date: formState.date,
    };
    if (newDeposit.memberId && !isNaN(newDeposit.amount)) {
      if (currentItem) {
        updateDeposit(currentItem.id, newDeposit);
      } else {
        addDeposit(newDeposit);
      }
      handleCloseModal();
    }
  };

  const handleDelete = () => {
    if (itemToDelete) {
        deleteDeposit(itemToDelete.id);
        setIsConfirmOpen(false);
        setItemToDelete(null);
    }
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Deposits</h3>
        <button onClick={openAddModal} disabled={members.length === 0} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed">
          Add Deposit
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {deposits.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{getMemberName(item.memberId)}</p>
              <p className="text-sm text-gray-500">{item.date} - {formatCurrency(item.amount)}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
              <button onClick={() => openConfirmModal(item)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {deposits.length === 0 && <p className="text-center text-gray-500 mt-4">No deposits logged yet.</p>}
      {members.length === 0 && !isModalOpen && <p className="text-center text-gray-500 mt-4">Please add a member before adding a deposit.</p>}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'Edit Deposit' : 'Add New Deposit'}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Member</label>
            <select id="memberId" name="memberId" value={formState.memberId} onChange={handleChange} required className={commonInputClass}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
            <input id="amount" name="amount" type="number" step="0.01" value={formState.amount} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input id="date" name="date" type="date" value={formState.date} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
              {currentItem ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Deposit Entry"
        message={`Are you sure you want to delete the deposit of ${formatCurrency(itemToDelete?.amount || 0)} for ${getMemberName(itemToDelete?.memberId || '')}? This action cannot be undone.`}
      />
    </div>
  );
};
