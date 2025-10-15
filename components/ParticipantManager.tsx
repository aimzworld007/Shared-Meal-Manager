
/**
 * @file ParticipantManager.tsx
 * @summary A component for managing the list of participants.
 * It displays the current participants and provides functionality to add new ones
 * and delete existing ones.
 */
import React, { useState } from 'react';
import { Participant } from '../types';

/**
 * Props for the ParticipantManager component.
 */
interface ParticipantManagerProps {
    /** The current list of participants. */
    participants: Participant[];
    /** Callback function to add a new participant. */
    onAddParticipant: (name: string) => void;
    /** Callback function to delete an existing participant. */
    onDeleteParticipant: (id: string) => void;
}

/**
 * Renders a list of participants and a form to add new ones.
 * @param {ParticipantManagerProps} props - The component props.
 * @returns {JSX.Element} The rendered participant manager component.
 */
const ParticipantManager: React.FC<ParticipantManagerProps> = ({ participants, onAddParticipant, onDeleteParticipant }) => {
    const [newName, setNewName] = useState('');

    /**
     * Handles the form submission for adding a new participant.
     * Prevents default form action, calls the onAddParticipant prop, and resets the input field.
     * @param {React.FormEvent} e - The form event.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAddParticipant(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Participants</h3>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New participant name"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add</button>
            </form>
            <ul className="divide-y divide-gray-200">
                {participants.map(p => (
                    <li key={p.id} className="py-2 flex justify-between items-center">
                        <span className="text-sm text-gray-800">{p.name}</span>
                        <button onClick={() => onDeleteParticipant(p.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantManager;
