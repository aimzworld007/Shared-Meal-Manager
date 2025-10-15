/**
 * @file ParticipantManager.tsx
 * @summary A component for managing (add, edit, delete) meal participants/members.
 */
import React, { useState } from 'react';
import { Member } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface ParticipantManagerProps {
  members: Member[];
  addMember: (name: string) => void;
  updateMember: (id: string, name: string) => void;
  deleteMember: (id: string) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({ members, addMember, updateMember, deleteMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const openAddModal = () => {
    setCurrentMember(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setCurrentMember(member);
    setName(member.name);
    setIsModalOpen(true);
  };
  
  const openConfirmModal = (member: Member) => {
    setMemberToDelete(member);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMember(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (currentMember) {
        updateMember(currentMember.id, name.trim());
      } else {
        addMember(name.trim());
      }
      handleCloseModal();
    }
  };

  const handleDelete = () => {
    if (memberToDelete) {
        deleteMember(memberToDelete.id);
        setIsConfirmOpen(false);
        setMemberToDelete(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Members</h3>
        <button onClick={openAddModal} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 text-sm">
          Add Member
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.id} className="py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <div className="space-x-2">
              <button onClick={() => openEditModal(member)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
              <button onClick={() => openConfirmModal(member)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {members.length === 0 && <p className="text-center text-gray-500 mt-4">No members added yet.</p>}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentMember ? 'Edit Member' : 'Add New Member'}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">Member Name</label>
          <input
            id="memberName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
              {currentMember ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
};
