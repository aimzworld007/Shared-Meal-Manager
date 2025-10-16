/**
 * @file SettingsPage.tsx
 * @summary The user settings page for managing account details.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSiteSettings } from '../hooks/useSiteSettings';
import ReauthModal from './ReauthModal';
import { SiteSettings } from '../types';

const SettingsPage: React.FC = () => {
  const { user, changeEmail, changePassword, error: authError, clearError } = useAuth();
  const { settings, updateSettings, loading: settingsLoading } = useSiteSettings();
  
  // State for account management modals
  const [reauthAction, setReauthAction] = useState<'email' | 'password' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for admin site settings form
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle || '');
      setSiteDescription(settings.siteDescription || '');
      setLogoPreview(settings.logoUrl || null);
    }
  }, [settings]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updates: Partial<SiteSettings> = {};
      if (siteTitle !== settings?.siteTitle) updates.siteTitle = siteTitle;
      if (siteDescription !== settings?.siteDescription) updates.siteDescription = siteDescription;
      
      await updateSettings(updates, logoFile || undefined);
      
      alert("Site settings updated successfully!");
      setLogoFile(null); 
    } catch (err: any) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

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
          } catch (e) {
             // error is handled by auth context
          }
      } else if (reauthAction === 'password') {
          try {
              await changePassword(newPassword);
              setReauthAction(null);
              setNewPassword('');
              setConfirmPassword('');
              alert("Password updated successfully!");
          } catch (e) {
              // error is handled by auth context
          }
      }
  }

  const AdminSettingsPanel = () => (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">Site Management (Admin)</h3>
      </div>
      <form onSubmit={handleAdminSettingsSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">Site Title</label>
          <input id="siteTitle" type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">Site Description</label>
          <textarea id="siteDescription" value={siteDescription} onChange={e => setSiteDescription(e.target.value)} rows={3} className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Logo</label>
          <div className="mt-1 flex items-center space-x-4">
            {logoPreview && <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 rounded-md object-contain bg-gray-100" />}
            <input type="file" id="logoFile" accept="image/*" onChange={handleLogoFileChange} className="text-sm" />
          </div>
        </div>
        <div className="pt-2 text-right">
          <button type="submit" disabled={isUpdating || settingsLoading} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            {isUpdating ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      {user?.isAdmin && <AdminSettingsPanel />}
      
       {/* Account Security */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Account Security</h3>
        </div>
        <div className="p-6 space-y-6">
            {/* Change Email */}
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
            {/* Change Password */}
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
    </div>
  );
};

export default SettingsPage;
