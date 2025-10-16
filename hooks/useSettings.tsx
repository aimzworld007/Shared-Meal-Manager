/**
 * @file useSettings.tsx
 * @summary Provides a context and hook for managing global site settings.
 */
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { SiteConfig } from '../types';
import * as api from '../services/firebase';
import { logoDataUri as defaultLogo } from '../assets/logo';

interface SettingsContextType {
  config: SiteConfig | null;
  loading: boolean;
  updateSettings: (data: Partial<SiteConfig>) => Promise<void>;
  uploadAndSetLogo: (file: File) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: SiteConfig = {
  title: 'Shared Meal Manager',
  description: 'A web application to manage shared meal expenses.',
  logoUrl: defaultLogo,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await api.getSiteConfig();
      // If fetched logoUrl is empty, use the default embedded one.
      if (!settings.logoUrl) {
        settings.logoUrl = defaultLogo;
      }
      setConfig(settings);
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      setConfig(defaultSettings); // Fallback to default on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (data: Partial<SiteConfig>) => {
    try {
      await api.updateSiteConfig(data);
      // Optimistically update local state
      setConfig(prevConfig => prevConfig ? { ...prevConfig, ...data } : null);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  const uploadAndSetLogo = async (file: File) => {
    try {
      const newLogoUrl = await api.uploadLogo(file);
      await updateSettings({ logoUrl: newLogoUrl });
    } catch (error) {
      console.error("Failed to upload logo:", error);
      throw error;
    }
  };

  const value = { config, loading, updateSettings, uploadAndSetLogo };

  return (
    <SettingsContext.Provider value={value}>
      {!loading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
