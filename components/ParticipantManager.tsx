/**
 * @file MemberManager.tsx
 * @summary A component for managing the list of members.
 * It displays the current members and provides functionality to add new ones
 * and delete existing ones.
 */
import React, { useState } from 'react';
import { Member } from '../types';

/**
 * Props for the MemberManager component.
 */
interface MemberManagerProps {
    /** The current list of members. */
    members: Member[];
    /** Callback function to add a new member. */
    onAddMember: (name: string) => void;
    /** Callback function to delete an existing member. */
    onDeleteMember: (id: string) => void;
}

/**
 * Renders a list of members and a form to add new ones.
 * @param {MemberManagerProps} props - The component props.
 * @returns {JSX.Element} The rendered member manager component.
 */
const MemberManager: React.FC<MemberManagerProps> = ({ members, onAddMember, onDeleteMember }) => {
    const [newName, setNewName] = useState('');

    /**
     * Handles the form submission for adding a new member.
     * Prevents default form action, calls the onAddMember prop, and resets the input field.
     * @param {React.FormEvent} e - The form event.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAddMember(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Members</h3>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New member name"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add</button>
            </form>
            <ul className="divide-y divide-gray-200">
                {members.map(m => (
                    <li key={m.id} className="py-2 flex justify-between items-center">
                        <span className="text-sm text-gray-800">{m.name}</span>
                        <button onClick={() => onDeleteMember(m.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemberManager;
