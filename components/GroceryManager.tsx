/**
 * @file GroceryManager.tsx
 * @summary A component for managing grocery purchase entries.
 */
import React, { useState, useMemo } from 'react';
import { GroceryItem, Member } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  members: Member[];
  addGrocery: (item: Omit<GroceryItem, 'id'>) => void;
  updateGrocery: (id: string, item: Omit<GroceryItem, 'id'>) => void;
  deleteGrocery: (id: string) => void;
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

export const GroceryManager: React.FC<GroceryManagerProps> = ({ groceries, members, addGrocery, updateGrocery, deleteGrocery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GroceryItem | null>(null);
  const [formState, setFormState] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], memberIds: [] as string[] });
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m.name])), [members]);
  const getMemberNames = (memberIds: string[]) => memberIds.map(id => memberMap.get(id) || 'Unknown').join(', ');

  const openAddModal = () => {
    setCurrentItem(null);
    setFormState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], memberIds: members.map(m => m.id) });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GroceryItem) => {
    setCurrentItem(item);
    setFormState({ name: item.name, amount: item.amount.toString(), date: formatDateForInput(item.date), memberIds: item.memberIds });
    setIsModalOpen(true);
  };
  
  const openConfirmModal = (item: GroceryItem) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberSelection = (memberId: string) => {
    setFormState(prev => {
        const newMemberIds = prev.memberIds.includes(memberId)
            ? prev.memberIds.filter(id => id !== memberId)
            : [...prev.memberIds, memberId];
        return { ...prev, memberIds: newMemberIds };
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrocery = {
      name: formState.name.trim(),
      amount: parseFloat(formState.amount),
      date: formState.date,
      memberIds: formState.memberIds,
    };
    if (newGrocery.name && !isNaN(newGrocery.amount) && newGrocery.memberIds.length > 0) {
      if (currentItem) {
        updateGrocery(currentItem.id, newGrocery);
      } else {
        addGrocery(newGrocery);
      }
      handleCloseModal();
    }
  };

  const handleDelete = () => {
    if (itemToDelete) {
        deleteGrocery(itemToDelete.id);
        setIsConfirmOpen(false);
        setItemToDelete(null);
    }
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Groceries</h3>
        <button onClick={openAddModal} disabled={members.length === 0} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed">
          Add Grocery Item
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {groceries.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name} - {formatCurrency(item.amount)}</p>
              <p className="text-sm text-gray-500">{item.date} | Shared by: {getMemberNames(item.memberIds)}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
              <button onClick={() => openConfirmModal(item)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {groceries.length === 0 && <p className="text-center text-gray-500 mt-4">No grocery items logged yet.</p>}
      {members.length === 0 && !isModalOpen && <p className="text-center text-gray-500 mt-4">Please add a member before adding a grocery item.</p>}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'Edit Grocery Item' : 'Add New Grocery Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
            <input id="name" name="name" type="text" value={formState.name} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
            <input id="amount" name="amount" type="number" step="0.01" value={formState.amount} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input id="date" name="date" type="date" value={formState.date} onChange={handleChange} required className={commonInputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shared By</label>
            <div className="mt-2 space-y-2">
                {members.map(member => (
                    <div key={member.id} className="flex items-center">
                        <input
                            id={`member-${member.id}`}
                            type="checkbox"
                            checked={formState.memberIds.includes(member.id)}
                            onChange={() => handleMemberSelection(member.id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`member-${member.id}`} className="ml-3 block text-sm text-gray-900">{member.name}</label>
                    </div>
                ))}
            </div>
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
        title="Delete Grocery Entry"
        message={`Are you sure you want to delete the entry for ${itemToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};
