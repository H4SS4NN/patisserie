'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getPageContent } from '@/lib/api';

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

interface SiteSettings {
  brandName: string;
  adminBrandName?: string;
  footerText: string;
  socialLinks: SocialLink[];
}

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  brandName: 'Assia',
  adminBrandName: 'Assia Admin',
  footerText: '© 2024 Assia. Tous droits réservés.',
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/assiapatisserie' },
    { platform: 'instagram', url: 'https://instagram.com/assiapatisserie' },
  ],
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {
    /* noop */
  },
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const page = await getPageContent<{
        brandName?: string;
        adminBrandName?: string;
        footerText?: string;
        socialLinks?: SocialLink[];
      }>('site-info');
      const content = page.content || {};
      setSettings({
        brandName: content.brandName?.trim() || defaultSettings.brandName,
        adminBrandName: content.adminBrandName?.trim() || content.brandName?.trim() || defaultSettings.adminBrandName,
        footerText: content.footerText?.trim() || defaultSettings.footerText,
        socialLinks:
          Array.isArray(content.socialLinks) && content.socialLinks.length > 0
            ? content.socialLinks
            : defaultSettings.socialLinks,
      });
    } catch (error) {
      console.error('Failed to load site settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<SiteSettingsContextValue>(
    () => ({
      settings,
      loading,
      refresh,
    }),
    [settings, loading, refresh]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}


