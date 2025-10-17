/**
 * @file SiteSettingsManager.tsx
 * @summary A component for administrators to manage global site settings.
 */
import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { SiteSettings } from '../types';

const SiteSettingsManager: React.FC = () => {
    const { settings, updateSettings, loading } = useSiteSettings();
    const [formData, setFormData] = useState<Partial<SiteSettings>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                siteTitle: settings.siteTitle || '',
                siteDescription: settings.siteDescription || '',
            });
        }
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateSettings(formData, logoFile || undefined);
            alert("Site settings updated successfully!");
            setLogoFile(null); // Clear file input after submission
        } catch (error) {
            console.error(error);
            alert(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
             <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400">Loading site settings...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Site Management (Admin)</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Site Title */}
                <div>
                    <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Title</label>
                    <input 
                        id="siteTitle" 
                        name="siteTitle"
                        type="text" 
                        value={formData.siteTitle || ''} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" 
                    />
                </div>
                {/* Site Description */}
                <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Description</label>
                    <textarea 
                        id="siteDescription" 
                        name="siteDescription"
                        rows={3}
                        value={formData.siteDescription || ''} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-300" 
                    />
                </div>
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Logo</label>
                    {settings?.logoUrl && <img src={settings.logoUrl} alt="Current logo" className="h-16 w-16 object-contain my-2 rounded-md bg-gray-100 dark:bg-gray-900 p-1" />}
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange} 
                        className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
                    />
                     {logoFile && <p className="text-xs text-gray-500 mt-1">New logo selected: {logoFile.name}</p>}
                </div>
                {/* Submit Button */}
                <div>
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                       {isSubmitting ? 'Saving...' : 'Save Site Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsManager;
