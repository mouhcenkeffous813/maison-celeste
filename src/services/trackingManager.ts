/**
 * Central Tracking Manager
 * Coordinates Meta and TikTok pixel execution, consent checks, and event logs.
 */

import { metaPixel } from './metaPixel';
import { tikTokPixel } from './tiktokPixel';
import { consentManager } from './consentManager';
import { MarketingConfig, TrackingEventData, TrackedEventLog } from '../types/marketing';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const MARKETING_CONFIG_KEY = 'maison_celeste_marketing_config';
const EVENT_LOGS_KEY = 'maison_celeste_tracking_logs';

export const DEFAULT_MARKETING_CONFIG: MarketingConfig = {
  meta: {
    pixelId: '',
    enabled: false,
    testMode: false,
    trackEvents: true,
  },
  tiktok: {
    pixelId: '',
    enabled: false,
    testMode: false,
    trackEvents: true,
  },
  requireConsent: true,
};

class TrackingManager {
  private config: MarketingConfig = DEFAULT_MARKETING_CONFIG;
  private isConfigLoaded = false;
  private lastTrackedPage: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadConfig();
      // Listen to consent changes to dynamically initialize pixels if user grants permission
      window.addEventListener('maison_celeste_consent_update', () => {
        this.initPixels();
      });
    }
  }

  /**
   * Load configuration from localStorage & Supabase if available
   */
  public async loadConfig(): Promise<MarketingConfig> {
    if (typeof window === 'undefined') return DEFAULT_MARKETING_CONFIG;

    let localConf = DEFAULT_MARKETING_CONFIG;
    try {
      const stored = localStorage.getItem(MARKETING_CONFIG_KEY);
      if (stored) {
        localConf = { ...DEFAULT_MARKETING_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse local marketing config', e);
    }

    // Try to load from Supabase if table exists
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('marketing_integrations')
          .select('*');

        if (!error && Array.isArray(data) && data.length > 0) {
          data.forEach(item => {
            if (item.platform === 'meta') {
              localConf.meta.pixelId = item.pixel_id || localConf.meta.pixelId;
              localConf.meta.enabled = item.enabled ?? localConf.meta.enabled;
            } else if (item.platform === 'tiktok') {
              localConf.tiktok.pixelId = item.pixel_id || localConf.tiktok.pixelId;
              localConf.tiktok.enabled = item.enabled ?? localConf.tiktok.enabled;
            }
          });
        }
      } catch (err) {
        // Table might not be created yet in user's Supabase instance, fail gracefully
      }
    }

    this.config = localConf;
    this.isConfigLoaded = true;
    this.initPixels();
    return this.config;
  }

  /**
   * Save configuration to localStorage & Supabase
   */
  public async saveConfig(newConfig: Partial<MarketingConfig>): Promise<MarketingConfig> {
    this.config = { ...this.config, ...newConfig };

    try {
      localStorage.setItem(MARKETING_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save marketing config locally', e);
    }

    // Sync to Supabase if available
    if (supabase && isSupabaseConfigured) {
      try {
        const rows = [
          {
            id: 'meta-pixel',
            platform: 'meta',
            pixel_id: this.config.meta.pixelId,
            enabled: this.config.meta.enabled,
            updated_at: new Date().toISOString(),
          },
          {
            id: 'tiktok-pixel',
            platform: 'tiktok',
            pixel_id: this.config.tiktok.pixelId,
            enabled: this.config.tiktok.enabled,
            updated_at: new Date().toISOString(),
          },
        ];

        await supabase
          .from('marketing_integrations')
          .upsert(rows, { onConflict: 'id' });
      } catch (err) {
        // If table doesn't exist, we don't block
        console.warn('Supabase marketing_integrations not available, saved locally');
      }
    }

    this.initPixels();
    return this.config;
  }

  public getConfig(): MarketingConfig {
    return this.config;
  }

  /**
   * Initialize pixels if enabled and consent is granted
   */
  public initPixels(): void {
    if (!consentManager.isMarketingAllowed()) {
      return;
    }

    if (this.config.meta.enabled && this.config.meta.pixelId) {
      metaPixel.init(this.config.meta.pixelId, this.config.meta.testMode);
    }

    if (this.config.tiktok.enabled && this.config.tiktok.pixelId) {
      tikTokPixel.init(this.config.tiktok.pixelId, this.config.tiktok.testMode);
    }
  }

  /**
   * Central dispatch for e-commerce tracking events
   */
  public trackEvent(data: TrackingEventData): void {
    // Generate unique eventId for deduplication if not provided
    const eventId = data.eventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const eventPayload: TrackingEventData = {
      ...data,
      eventId,
      currency: data.currency || 'DZD',
    };

    const hasConsent = consentManager.isMarketingAllowed();

    // Check if both pixels are disabled or no consent
    if (!hasConsent) {
      this.logEvent(eventPayload, 'Both', 'blocked_consent');
      return;
    }

    let metaSent = false;
    let tikTokSent = false;

    // 1. Meta Pixel
    if (this.config.meta.enabled && this.config.meta.pixelId && this.config.meta.trackEvents) {
      metaSent = metaPixel.track(eventPayload);
    }

    // 2. TikTok Pixel
    if (this.config.tiktok.enabled && this.config.tiktok.pixelId && this.config.tiktok.trackEvents) {
      tikTokSent = tikTokPixel.track(eventPayload);
    }

    const platformTarget: 'Meta' | 'TikTok' | 'Both' =
      metaSent && tikTokSent ? 'Both' : metaSent ? 'Meta' : tikTokSent ? 'TikTok' : 'Both';

    if (metaSent || tikTokSent) {
      this.logEvent(eventPayload, platformTarget, 'sent');
    } else {
      this.logEvent(eventPayload, 'Both', 'disabled');
    }
  }

  /**
   * Specialized PageView handler with SPA deduplication
   */
  public trackPageView(pageIdentifier: string): void {
    if (this.lastTrackedPage === pageIdentifier) {
      // Prevent duplicate PageView on re-renders
      return;
    }
    this.lastTrackedPage = pageIdentifier;
    this.trackEvent({
      eventName: 'PageView',
      contentName: pageIdentifier,
    });
  }

  /**
   * Keep a lightweight, sanitized in-memory and local history of recent events for Admin Dashboard
   * NEVER store personal data (phone numbers, full names, addresses)
   */
  private logEvent(
    data: TrackingEventData,
    platform: 'Meta' | 'TikTok' | 'Both',
    status: 'sent' | 'blocked_consent' | 'disabled'
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const logs = this.getRecentLogs();
      let detailStr = '';
      if (data.contentName) detailStr += data.contentName;
      if (data.value) detailStr += ` (${data.value} ${data.currency || 'DA'})`;
      if (data.searchQuery) detailStr += ` Recherche: "${data.searchQuery}"`;

      const newLog: TrackedEventLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventName: data.eventName,
        platform,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        details: detailStr || 'Événement standard',
        status,
      };

      const updated = [newLog, ...logs].slice(0, 30); // Keep last 30 events
      localStorage.setItem(EVENT_LOGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('maison_celeste_tracking_log_update'));
    } catch (e) {
      // Ignore
    }
  }

  public getRecentLogs(): TrackedEventLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(EVENT_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(EVENT_LOGS_KEY);
      window.dispatchEvent(new CustomEvent('maison_celeste_tracking_log_update'));
    }
  }

  /**
   * Test Pixel Connection
   */
  public async testPixel(platform: 'meta' | 'tiktok'): Promise<{ success: boolean; message: string }> {
    const hasConsent = consentManager.isMarketingAllowed();
    if (!hasConsent) {
      return {
        success: false,
        message: 'Le consentement marketing est actuellement refusé ou en attente. Acceptez les cookies pour tester.',
      };
    }

    const conf = platform === 'meta' ? this.config.meta : this.config.tiktok;

    if (!conf.pixelId || conf.pixelId.trim() === '') {
      return {
        success: false,
        message: `Veuillez d'abord renseigner un Pixel ID ${platform === 'meta' ? 'Meta' : 'TikTok'}.`,
      };
    }

    if (!conf.enabled) {
      return {
        success: false,
        message: `Veuillez activer l'interrupteur du Pixel ${platform === 'meta' ? 'Meta' : 'TikTok'} avant de tester.`,
      };
    }

    // Force init and send test event
    if (platform === 'meta') {
      metaPixel.init(conf.pixelId, true);
      const ok = metaPixel.track({
        eventName: 'PageView',
        eventId: `test-meta-${Date.now()}`,
        contentName: 'Test Diagnostic Admin Meta Pixel',
      });
      return {
        success: ok,
        message: ok
          ? 'Signal de test Meta Pixel envoyé avec succès (événement PageView émis dans le navigateur).'
          : 'Échec de transmission du signal Meta Pixel. Vérifiez votre ID.',
      };
    } else {
      tikTokPixel.init(conf.pixelId, true);
      const ok = tikTokPixel.track({
        eventName: 'PageView',
        eventId: `test-tiktok-${Date.now()}`,
        contentName: 'Test Diagnostic Admin TikTok Pixel',
      });
      return {
        success: ok,
        message: ok
          ? 'Signal de test TikTok Pixel envoyé avec succès (événement PageView émis dans le navigateur).'
          : 'Échec de transmission du signal TikTok Pixel. Vérifiez votre ID.',
      };
    }
  }
}

export const trackingManager = new TrackingManager();
