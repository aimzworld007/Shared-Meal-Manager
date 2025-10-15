/**
 * @file ParticipantManager.tsx
 * @summary Component for adding and removing meal plan members.
 */
import React, { useState } from 'react';
import { Member } from '../types';

interface ParticipantManagerProps {
  members: Member[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({ members, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Manage Members</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New member name"
          className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add
        </button>
      </form>
      <ul className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.id} className="py-3 flex justify-between items-center">
            <span className="text-gray-800">{member.name}</span>
            <button
              onClick={() => onDelete(member.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </li>
        ))}
         {members.length === 0 && <p className="text-center text-gray-500">No members added yet.</p>}
      </ul>
    </div>
  );
};
