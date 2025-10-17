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
import { Participant } from '../types';
import { useMealManager } from '../hooks/useMealManager';
import PeriodManager from './PeriodManager';
import SiteSettingsManager from './SiteSettingsManager';
import DeleteAccountConfirmationModal from './DeleteAccountConfirmationModal';

interface SettingsPageProps {
  mealManager: ReturnType<typeof useMealManager>;
}

// --- Icon Components ---
const MakeManagerIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
const EditIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const DeleteIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const UploadIcon = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const DownloadIcon = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ mealManager }) => {
  const { user, changeEmail, changePassword, deleteAccount, error: authError, clearError } = useAuth();
  const { members, summary, addMember, updateMember, deleteMember, setMealManager, importGroceryItems } = mealManager;
  
  // --- Account Security State ---
  const [reauthAction, setReauthAction] = useState<'email' | 'password' | 'delete' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDeleteAccount = () => {
    setReauthAction('delete');
    clearError();
  };
  
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
      } else if (reauthAction === 'delete') {
          setReauthAction(null);
          setIsDeleteModalOpen(true);
      }
  }

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      setIsDeleteModalOpen(false);
      // User is logged out by the auth provider, no need to redirect here.
      alert("Your account has been successfully deleted.");
    } catch (e) {
      // Error is handled and displayed by auth context.
      alert("Failed to delete account. Please try logging out and in again.");
    }
  };
  
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
        await updateMember(editingMember.id, memberName, memberPhone);
      } else {
        await addMember(memberName, memberPhone);
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
      await deleteMember(memberToDelete.id);
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Period Management */}
      <PeriodManager mealManager={mealManager} />

      {/* Member Management */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Member Management</h3>
          <button onClick={openAddMemberModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Add New Member
          </button>
        </div>
        <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map(member => (
                    <li key={member.id} className="py-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</p>
                        </div>
                        <div className="flex items-center">
                            {member.isMealManager ? (
                                <span className="px-2 py-1 text-xs font-semibold leading-tight text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 rounded-full">
                                    Meal Manager
                                </span>
                            ) : (
                                <button 
                                    onClick={() => setMealManager(member.id)} 
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
                                    title="Make Meal Manager"
                                >
                                    <MakeManagerIcon />
                                </button>
                            )}
                            <button onClick={() => openEditMemberModal(member)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400" title="Edit Member">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteMemberClick(member)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete Member">
                                <DeleteIcon />
                            </button>
                        </div>
                    </li>
                ))}
                {members.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No members have been added yet.</p>}
            </ul>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Data Management</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setIsImportModalOpen(true)} className="w-full inline-flex items-center justify-center text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><UploadIcon />Import Groceries</button>
            <button onClick={handleExportGroceries} className="w-full inline-flex items-center justify-center text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><DownloadIcon />Export Groceries</button>
            <button onClick={handleExportDeposits} className="w-full inline-flex items-center justify-center text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><DownloadIcon />Export Deposits</button>
            <button onClick={handleExportSummary} className="w-full inline-flex items-center justify-center text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><DownloadIcon />Export Summary</button>
        </div>
      </div>

       {/* Account Security */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Account Security</h3>
        </div>
        <div className="p-6 space-y-6">
            <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Change Email Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Email: <span className="font-semibold">{user?.email}</span></p>
                 <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Email</label>
                    <input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" />
                </div>
                <button onClick={handleEmailChange} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Change Email
                </button>
            </div>
            <div className="space-y-4">
                 <h4 className="font-medium text-gray-900 dark:text-gray-100">Change Password</h4>
                 <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" placeholder="Min. 6 characters" />
                </div>
                 <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" />
                </div>
                 <button onClick={handlePasswordChange} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Change Password
                </button>
            </div>
        </div>
      </div>
      
      {/* Admin Site Settings */}
      {user?.isAdmin && <SiteSettingsManager />}

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-red-100 dark:bg-red-900/30 rounded-t-lg">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Danger Zone</h3>
        </div>
        <div className="p-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Delete this Account</h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
          <button onClick={handleDeleteAccount} className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
            Delete My Account
          </button>
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

      <DeleteAccountConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
      />

      <Modal title={editingMember ? "Edit Member" : "Add Member"} isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)}>
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Name</label>
            <input id="memberName" type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <label htmlFor="memberPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <input id="memberPhone" type="tel" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" />
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
      
      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={importGroceryItems} />
    </div>
  );
};

export default SettingsPage;