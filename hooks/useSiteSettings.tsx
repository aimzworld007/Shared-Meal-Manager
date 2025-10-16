/**
 * @file useSiteSettings.tsx
 * @summary Provides a context and hook for managing global site settings.
 */
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import * as api from '../services/firebase';
import { useAuth } from './useAuth';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  updateSettings: (data: Partial<SiteSettings>, logoFile?: File) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const siteData = await api.getSiteSettings();
      setSettings(siteData);
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (data: Partial<SiteSettings>, logoFile?: File) => {
    if (!user?.isAdmin) {
      throw new Error("You are not authorized to perform this action.");
    }

    let updatedData = { ...data };

    if (logoFile) {
      const logoUrl = await api.uploadLogo(logoFile);
      updatedData.logoUrl = logoUrl;
    }

    await api.updateSiteSettings(updatedData);
    await fetchSettings(); // Refresh settings after update
  };
  
  const value = { settings, loading, updateSettings };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = (): SiteSettingsContextType => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
