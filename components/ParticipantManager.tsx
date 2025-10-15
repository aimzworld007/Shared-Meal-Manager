/**
 * @file ParticipantManager.tsx
 * @summary A component for managing (adding, viewing, deleting) meal plan members.
 */
import React, { useState } from 'react';
import { Member } from '../types';
import Modal from './Modal';

interface ParticipantManagerProps {
  members: Member[];
  addMember: (name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({ members, addMember, deleteMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setIsSubmitting(true);
    await addMember(newMemberName);
    setIsSubmitting(false);
    setNewMemberName('');
    setIsModalOpen(false);
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Members</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm"
        >
          Add Member
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.id} className="py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <button onClick={() => deleteMember(member.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Remove
            </button>
          </li>
        ))}
      </ul>
      {members.length === 0 && <p className="text-center text-gray-500 mt-4">No members added yet.</p>}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Member">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">Member Name</label>
            <input
              id="memberName"
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="mt-4 text-right">
             <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
