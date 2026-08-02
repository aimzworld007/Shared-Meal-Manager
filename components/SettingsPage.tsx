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
import DeleteAccountConfirmationModal from './DeleteAccountConfirmationModal';
import CurrencySettings from './CurrencySettings';

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
    <div className="space-y-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>

      {/* Period Management */}
      <PeriodManager mealManager={mealManager} />
      
      {/* Currency Settings */}
      <CurrencySettings />

      {/* Member Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Member Management</h3>
          <button onClick={openAddMemberModal} className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
            Add New Member
          </button>
        </div>
        <div className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {members.map(member => (
                    <li key={member.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{member.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {member.isMealManager ? (
                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full mr-2">
                                    Meal Manager
                                </span>
                            ) : (
                                <button 
                                    onClick={() => setMealManager(member.id)} 
                                    className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors active:scale-95"
                                    title="Make Meal Manager"
                                >
                                    <MakeManagerIcon />
                                </button>
                            )}
                            <button onClick={() => openEditMemberModal(member)} className="p-2.5 rounded-full text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors active:scale-95" title="Edit Member">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteMemberClick(member)} className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors active:scale-95" title="Delete Member">
                                <DeleteIcon />
                            </button>
                        </div>
                    </li>
                ))}
                {members.length === 0 && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-10">No members have been added yet.</p>}
            </ul>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Data Management</h3>
        </div>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setIsImportModalOpen(true)} className="w-full inline-flex items-center justify-center text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 hover:border-slate-300 dark:hover:border-slate-600"><UploadIcon />Import Groceries</button>
            <button onClick={handleExportGroceries} className="w-full inline-flex items-center justify-center text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 hover:border-slate-300 dark:hover:border-slate-600"><DownloadIcon />Export Groceries</button>
            <button onClick={handleExportDeposits} className="w-full inline-flex items-center justify-center text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 hover:border-slate-300 dark:hover:border-slate-600"><DownloadIcon />Export Deposits</button>
            <button onClick={handleExportSummary} className="w-full inline-flex items-center justify-center text-center px-4 py-3 border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 hover:border-slate-300 dark:hover:border-slate-600"><DownloadIcon />Export Summary</button>
        </div>
      </div>

       {/* Account Security */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Account Security</h3>
        </div>
        <div className="p-8 space-y-8">
            <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                <h4 className="font-bold text-slate-900 dark:text-white">Change Email Address</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Email: <span className="font-bold text-slate-900 dark:text-white">{user?.email}</span></p>
                 <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Email</label>
                    <input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="block w-full sm:w-80 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
                </div>
                <button onClick={handleEmailChange} className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
                    Change Email
                </button>
            </div>
            <div className="space-y-4">
                 <h4 className="font-bold text-slate-900 dark:text-white">Change Password</h4>
                 <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full sm:w-80 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" placeholder="Min. 6 characters" />
                </div>
                 <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full sm:w-80 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
                </div>
                 <button onClick={handlePasswordChange} className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
                    Change Password
                </button>
            </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/30 rounded-[2rem] overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        <div className="px-8 py-5 bg-red-100/50 dark:bg-red-900/20 border-b border-red-200/50 dark:border-red-900/30">
          <h3 className="text-xl font-bold text-red-800 dark:text-red-300 tracking-tight">Danger Zone</h3>
        </div>
        <div className="p-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Delete this Account</h4>
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1 max-w-sm">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
          <button onClick={handleDeleteAccount} className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-95">
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
            <label htmlFor="memberName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member Name</label>
            <input id="memberName" type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
          </div>
          <div>
            <label htmlFor="memberPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input id="memberPhone" type="tel" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmittingMember} className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95 disabled:bg-indigo-400 disabled:active:scale-100">
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