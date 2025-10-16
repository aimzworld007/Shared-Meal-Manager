/**
 * @file MemberAndDepositManager.tsx
 * @summary A unified component for adding members and managing all deposits.
 */
import React, { useState } from 'react';
import { Deposit, Participant } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface MemberAndDepositManagerProps {
  deposits: Deposit[];
  members: Participant[];
  onAddMember: (name: string) => Promise<void>;
  onAddDeposit: (item: Omit<Deposit, 'id'>) => Promise<void>;
  onDeleteDeposit: (item: Deposit) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const MemberAndDepositManager: React.FC<MemberAndDepositManagerProps> = ({ deposits, members, onAddMember, onAddDeposit, onDeleteDeposit }) => {
  // State for adding a new member
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // State for adding a deposit
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState<Participant | null>(null);
  const [isAddingDeposit, setIsAddingDeposit] = useState(false);

  // State for deleting a deposit
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Deposit | null>(null);

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || isAddingMember) return;
    setIsAddingMember(true);
    try {
      await onAddMember(newMemberName.trim());
      setNewMemberName('');
    } catch (error) {
      console.error(error); // Error is handled globally in the hook
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleOpenDepositModal = (member: Participant) => {
    setSelectedMember(member);
    setIsDepositModalOpen(true);
  };
  
  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedMember(null);
    setDepositAmount('');
    setDepositDate(new Date().toISOString().split('T')[0]);
  }

  const handleAddDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositDate || !selectedMember || isAddingDeposit) return;
    setIsAddingDeposit(true);
    try {
      await onAddDeposit({
        amount: parseFloat(depositAmount),
        date: depositDate,
        userId: selectedMember.id,
      });
      handleCloseDepositModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingDeposit(false);
    }
  };
  
  const handleDeleteClick = (item: Deposit) => {
    setItemToDelete(item);
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
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Member & Deposit Management</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddMemberSubmit} className="space-y-4 pb-6 border-b">
            <h4 className="text-md font-medium text-gray-800">Add New Member</h4>
            <div className="flex gap-4 items-end">
                <div className="flex-grow">
                    <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">Member Name</label>
                    <input
                      id="memberName"
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., John Doe"
                    />
                </div>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </button>
            </div>
          </form>
          
          <h4 className="text-md font-medium text-gray-800 mt-6 mb-2">Current Members ({members.length})</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {members.map(member => (
                        <tr key={member.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleOpenDepositModal(member)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                    Add Deposit
                                </button>
                            </td>
                        </tr>
                    ))}
                    {members.length === 0 && (
                        <tr><td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No members have been added.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit History Table */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Deposit History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deposits.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No deposits added yet.</td></tr>
              )}
              {deposits.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-800">{formatCurrency(item.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Deposit Modal */}
      <Modal title={`Add Deposit for ${selectedMember?.name || ''}`} isOpen={isDepositModalOpen} onClose={handleCloseDepositModal}>
        <form onSubmit={handleAddDepositSubmit} className="space-y-4">
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="deposit_date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="deposit_amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isAddingDeposit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {isAddingDeposit ? 'Adding...' : 'Add Deposit'}
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
    </>
  );
};

export default MemberAndDepositManager;
