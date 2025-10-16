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
  onUpdateMember: (memberId: string, name: string) => Promise<void>;
  onAddDeposit: (item: Omit<Deposit, 'id'>) => Promise<void>;
  onDeleteDeposit: (item: Deposit) => Promise<void>;
  onUpdateDeposit: (depositId: string, data: Partial<Omit<Deposit, 'id'>>) => Promise<void>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const MemberAndDepositManager: React.FC<MemberAndDepositManagerProps> = ({ deposits, members, onAddMember, onUpdateMember, onAddDeposit, onDeleteDeposit, onUpdateDeposit }) => {
  // --- Member state ---
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(true);
  const [editingMember, setEditingMember] = useState<Participant | null>(null);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [updatedMemberName, setUpdatedMemberName] = useState('');

  // --- Deposit state ---
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserIdForDeposit, setSelectedUserIdForDeposit] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // --- Deletion state ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Deposit | null>(null);

  // --- Member Handlers ---
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

  const openEditMemberModal = (member: Participant) => {
    setEditingMember(member);
    setUpdatedMemberName(member.name);
  };

  const closeEditMemberModal = () => {
    setEditingMember(null);
    setUpdatedMemberName('');
  };

  const handleUpdateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedMemberName.trim() || !editingMember || isUpdatingMember) return;
    setIsUpdatingMember(true);
    try {
      await onUpdateMember(editingMember.id, updatedMemberName.trim());
      closeEditMemberModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingMember(false);
    }
  };

  // --- Deposit Handlers ---
  const openAddDepositModal = (member: Participant) => {
    setEditingDeposit(null);
    setSelectedUserIdForDeposit(member.id);
    setDepositAmount('');
    setDepositDate(new Date().toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const openEditDepositModal = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setSelectedUserIdForDeposit(deposit.userId);
    setDepositAmount(String(deposit.amount));
    setDepositDate(new Date(deposit.date).toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setEditingDeposit(null);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositDate || !selectedUserIdForDeposit || isSubmittingDeposit) return;
    setIsSubmittingDeposit(true);
    
    const depositData = {
      amount: parseFloat(depositAmount),
      date: depositDate,
      userId: selectedUserIdForDeposit,
    };

    try {
      if (editingDeposit) {
        await onUpdateDeposit(editingDeposit.id, depositData);
      } else {
        await onAddDeposit(depositData);
      }
      closeDepositModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingDeposit(false);
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 px-1">Member & Deposit Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Add New Member Box */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add New Member</h3>
               <button
                type="button"
                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                className={`${
                  showAddMemberForm ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                role="switch"
                aria-checked={showAddMemberForm}
              >
                <span className="sr-only">Toggle Add Member Form</span>
                <span
                  aria-hidden="true"
                  className={`${
                    showAddMemberForm ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
              </button>
            </div>
            {showAddMemberForm && (
              <div className="p-6">
                <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                  <div>
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
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={isAddingMember}
                      className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 w-full sm:w-auto"
                    >
                      {isAddingMember ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Current Members Box */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Current Members <span className="text-gray-500 font-normal">({members.length})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
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
                          onClick={() => openEditMemberModal(member)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openAddDepositModal(member)}
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

        {/* Right Column */}
        <div className="lg:col-span-3">
          {/* Deposit History Box */}
          <div className="bg-white shadow-lg rounded-lg h-full">
            <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Deposit History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
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
                        <button onClick={() => openEditDepositModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Member Modal */}
      <Modal title="Edit Member" isOpen={!!editingMember} onClose={closeEditMemberModal}>
        <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
          <div>
            <label htmlFor="editMemberName" className="block text-sm font-medium text-gray-700">Member Name</label>
            <input
              id="editMemberName"
              type="text"
              value={updatedMemberName}
              onChange={(e) => setUpdatedMemberName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingMember}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isUpdatingMember ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Deposit Modal */}
      <Modal title={editingDeposit ? `Edit Deposit` : `Add Deposit`} isOpen={isDepositModalOpen} onClose={closeDepositModal}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label htmlFor="deposit_member" className="block text-sm font-medium text-gray-700">Member</label>
              <select
                id="deposit_member"
                value={selectedUserIdForDeposit}
                onChange={(e) => setSelectedUserIdForDeposit(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="deposit_date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="deposit_amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmittingDeposit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {isSubmittingDeposit ? 'Saving...' : (editingDeposit ? 'Save Changes' : 'Add Deposit')}
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
    </div>
  );
};

export default MemberAndDepositManager;