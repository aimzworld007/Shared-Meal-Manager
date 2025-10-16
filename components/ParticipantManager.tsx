/**
 * @file ParticipantManager.tsx
 * @summary Component for admin to add and view members.
 */
import React, { useState } from 'react';
import { Participant } from '../types';

interface MemberManagerProps {
  members: Participant[];
  onAddMember: (email: string, pass: string) => Promise<void>;
}

/**
 * Translates Firebase auth error codes from sign-up into user-friendly messages.
 * @param {string | undefined} errorCode - The error code from the Firebase auth error object.
 * @returns {string} A user-friendly error message.
 */
const getSignUpErrorMessage = (errorCode: string | undefined): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/weak-password':
        return 'Password is too weak. It must be at least 6 characters long.';
      default:
        return 'An unexpected error occurred while creating the member.';
    }
  };


const MemberManager: React.FC<MemberManagerProps> = ({ members, onAddMember }) => {
  const [email, setEmail] =useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
        await onAddMember(email, password);
        setEmail('');
        setPassword('');
        alert("Member successfully created. NOTE: This action may have logged you out. You might need to sign in again to see the changes.");
    } catch (err: any) {
        setError(getSignUpErrorMessage(err.code));
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Member Management</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 pb-6 border-b">
          <h4 className="text-md font-medium text-gray-800">Add New Member</h4>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Member Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="member@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Temporary Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Min. 6 characters"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
          </div>
        </form>
        <h4 className="text-md font-medium text-gray-800 mt-6 mb-4">Current Members ({members.length})</h4>
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="py-3">
              <p className="text-sm font-medium text-gray-900 truncate">{member.email}</p>
            </li>
          ))}
          {members.length === 0 && (
              <p className="text-sm text-gray-500 py-3">No members have been added.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MemberManager;