/**
 * @file ParticipantManager.tsx
 * @summary Component to display the list of participants in the meal group.
 */
import React from 'react';
import { Participant } from '../types';

interface ParticipantManagerProps {
  participants: Participant[];
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ participants }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Participants ({participants.length})</h3>
      <ul className="divide-y divide-gray-200">
        {participants.map((participant) => (
          <li key={participant.id} className="py-3">
            <p className="text-sm font-medium text-gray-900 truncate">{participant.email}</p>
          </li>
        ))}
         {participants.length === 0 && (
            <p className="text-sm text-gray-500">No other participants found.</p>
        )}
      </ul>
    </div>
  );
};

export default ParticipantManager;
