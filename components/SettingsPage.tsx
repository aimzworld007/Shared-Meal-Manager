/**
 * @file SettingsPage.tsx
 * @summary The user settings page for managing account details, members, and data.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ReauthModal from './ReauthModal';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import CSVImportModal from './CSVImportModal';
import { Participant, Deposit, GroceryItem, Member } from '../types';
import { ParsedGroceryItem } from '../utils/csvParser';

interface SettingsPageProps {
  members: Participant[];
  summary: {
    allGroceries: GroceryItem[];
    allDeposits: Deposit[];
    members: Member[];
  };
  onAddMember: (name: string, phone: string) => Promise<void>;
  onUpdateMember: (memberId: string, name: string, phone: string) => Promise<void>;
  onDeleteMember: (memberId: string) => Promise<void>;
  onImportGroceries: (items: ParsedGroceryItem[]) => Promise<void>;
}


const SettingsPage: React.FC<SettingsPageProps> = ({ members, summary, onAddMember, onUpdateMember, onDeleteMember, onImportGroceries }) => {
  const { user, changeEmail, changePassword, error: authError, clearError } = useAuth();
  
  // --- Account Security State ---
  const [reauthAction, setReauthAction] = useState<'email' | 'password' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Member Management State ---
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Participant | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Participant | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // --- Data Management State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Account Security Handlers ---
  const handleEmailChange = () => {
      if (!newEmail || newEmail === user?.email) {
          alert("Please enter a new, different email address.");
          return;
      }
      setReauthAction('email');
      clearError();
  }
  
  const handlePasswordChange = () => {
      if (!newPassword || newPassword.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
      }
      if (newPassword !== confirmPassword) {
          alert("Passwords do not match.");
          return;
      }
      setReauthAction('password');
      clearError();
  }
  
  const onReauthSuccess = async () => {
      if(reauthAction === 'email') {
          try {
              await changeEmail(newEmail);
              setReauthAction(null);
              setNewEmail('');
              alert("Email updated successfully! You may need to log in again with your new email.");
          } catch (e) { /* error handled by auth context */ }
      } else if (reauthAction === 'password') {
          try {
              await changePassword(newPassword);
              setReauthAction(null);
              setNewPassword('');
              setConfirmPassword('');
              alert("Password updated successfully!");
          } catch (e) { /* error handled by auth context */ }
      }
  }
  
  // --- Member Management Handlers ---
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberPhone('');
    setIsMemberModalOpen(true);
  };
  
  const openEditMemberModal = (member: Participant) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberPhone(member.phone);
    setIsMemberModalOpen(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMember(true);
    try {
      if (editingMember) {
        await onUpdateMember(editingMember.id, memberName, memberPhone);
      } else {
        await onAddMember(memberName, memberPhone);
      }
      setIsMemberModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleDeleteMemberClick = (member: Participant) => {
    setMemberToDelete(member);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      await onDeleteMember(memberToDelete.id);
    }
    setIsConfirmDeleteOpen(false);
    setMemberToDelete(null);
  };

  // --- Data Management Handlers ---
  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    // A simple CSV stringifier
    const replacer = (key: any, value: any) => value === null ? '' : value;
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleExportGroceries = () => {
    const dataToExport = summary.allGroceries.map(({ id, purchaserId, ...rest }) => rest);
    downloadCSV(dataToExport, `groceries-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDeposits = () => {
    const dataToExport = summary.allDeposits.map(({ id, userId, ...rest }) => rest);
    downloadCSV(dataToExport, `deposits-export-${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  const handleExportSummary = () => {
    const dataToExport = summary.members.map(({ id, ...rest }) => rest);
    downloadCSV(dataToExport, `balance-summary-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {/* Member Management */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Member Management</h3>
          <button onClick={openAddMemberModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Add New Member
          </button>
        </div>
        <div className="p-6">
            <ul className="divide-y divide-gray-200">
                {members.map(member => (
                    <li key={member.id} className="py-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.phone}</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => openEditMemberModal(member)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                            <button onClick={() => handleDeleteMemberClick(member)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                        </div>
                    </li>
                ))}
                {members.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No members have been added yet.</p>}
            </ul>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Data Management</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setIsImportModalOpen(true)} className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Import Groceries</button>
            <button onClick={handleExportGroceries} className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Export Groceries</button>
            <button onClick={handleExportDeposits} className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Export Deposits</button>
            <button onClick={handleExportSummary} className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Export Summary</button>
        </div>
      </div>

       {/* Account Security */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Account Security</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="space-y-4 border-b pb-6">
                <h4 className="font-medium">Change Email Address</h4>
                <p className="text-sm text-gray-600">Current Email: <span className="font-semibold">{user?.email}</span></p>
                 <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">New Email</label>
                    <input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <button onClick={handleEmailChange} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Change Email
                </button>
            </div>
            <div className="space-y-4">
                 <h4 className="font-medium">Change Password</h4>
                 <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Min. 6 characters" />
                </div>
                 <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                 <button onClick={handlePasswordChange} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Change Password
                </button>
            </div>
        </div>
      </div>
      
      {reauthAction && (
          <ReauthModal 
            isOpen={!!reauthAction}
            onClose={() => { setReauthAction(null); clearError(); }}
            onSuccess={onReauthSuccess}
            action={reauthAction}
            error={authError}
          />
      )}

      <Modal title={editingMember ? "Edit Member" : "Add Member"} isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)}>
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">Member Name</label>
            <input id="memberName" type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="memberPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="memberPhone" type="tel" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={isSubmittingMember} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmittingMember ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.name}? All associated groceries and deposits will remain but will be linked to an "Unknown Member". This action cannot be undone.`}
      />
      
      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onImportGroceries} />
    </div>
  );
};

export default SettingsPage;