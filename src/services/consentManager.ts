import { ConsentPreferences, ConsentStatus } from '../types/marketing';

const CONSENT_STORAGE_KEY = 'maison_celeste_cookie_consent';

export const consentManager = {
  getPreferences(): ConsentPreferences {
    if (typeof window === 'undefined') {
      return {
        status: 'pending',
        marketing: false,
        analytics: false,
        necessary: true,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read consent preferences', e);
    }

    return {
      status: 'pending',
      marketing: false,
      analytics: false,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
  },

  setPreferences(prefs: Partial<ConsentPreferences>): ConsentPreferences {
    const current = this.getPreferences();
    const updated: ConsentPreferences = {
      ...current,
      ...prefs,
      necessary: true, // Necessary is always true
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('maison_celeste_consent_update', { detail: updated })
      );
    } catch (e) {
      console.warn('Failed to save consent preferences', e);
    }

    return updated;
  },

  acceptAll(): ConsentPreferences {
    return this.setPreferences({
      status: 'granted',
      marketing: true,
      analytics: true,
    });
  },

  denyAll(): ConsentPreferences {
    return this.setPreferences({
      status: 'denied',
      marketing: false,
      analytics: false,
    });
  },

  isMarketingAllowed(): boolean {
    const prefs = this.getPreferences();
    return prefs.status === 'granted' && prefs.marketing === true;
  },

  hasUserDecided(): boolean {
    const prefs = this.getPreferences();
    return prefs.status !== 'pending';
  },

  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('maison_celeste_consent_update', {
          detail: this.getPreferences(),
        })
      );
    }
  },
};
