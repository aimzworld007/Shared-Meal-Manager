/**
 * @file SettingsPage.tsx
 * @summary The admin settings page for managing site and account details.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useDropzone } from 'react-dropzone';
import ReauthModal from './ReauthModal';

const SettingsPage: React.FC = () => {
  const { config, updateSettings, uploadAndSetLogo } = useSettings();
  const { user, changeEmail, changePassword, error: authError, clearError } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State for account management modals
  const [reauthAction, setReauthAction] = useState<'email' | 'password' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (config) {
      setTitle(config.title);
      setDescription(config.description);
    }
  }, [config]);
  
  const handleSiteInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ title, description });
      alert('Site information updated successfully!');
    } catch (error) {
      alert('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsUploading(true);
      try {
        await uploadAndSetLogo(file);
        alert('Logo updated successfully!');
      } catch (error) {
        alert('Failed to upload logo.');
      } finally {
        setIsUploading(false);
      }
    }
  }, [uploadAndSetLogo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/gif': ['.gif'] },
    multiple: false,
  });
  
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      {/* Site Information */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Site Information</h3>
        </div>
        <form onSubmit={handleSiteInfoSave} className="p-6 space-y-4">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">Site Title</label>
            <input id="siteTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea id="siteDescription" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={3} required />
          </div>
          <div className="text-right">
            <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSaving ? 'Saving...' : 'Save Site Info'}
            </button>
          </div>
        </form>
      </div>

      {/* Logo Upload */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">Site Logo</h3>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
             <img src={config?.logoUrl} alt="Current Logo" className="max-w-full max-h-full" />
          </div>
          <div {...getRootProps()} className={`flex-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer ${isDragActive ? 'bg-indigo-50' : ''}`}>
            <input {...getInputProps()} />
            <div className="space-y-1 text-center">
              <p>{isUploading ? "Uploading..." : "Drag 'n' drop a new logo here, or click to select a file."}</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>
      </div>
      
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
