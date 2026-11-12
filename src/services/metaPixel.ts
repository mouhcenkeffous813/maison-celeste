/**
 * Meta Pixel Service (Facebook & Instagram Ads)
 * Handles standard pixel initialization, consent checks, and standard event tracking.
 */

import { consentManager } from './consentManager';
import { TrackingEventData } from '../types/marketing';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

class MetaPixelService {
  private currentPixelId: string | null = null;
  private isInitialized = false;

  /**
   * Initialize Meta Pixel script dynamically
   */
  public init(pixelId: string, testMode = false): boolean {
    if (typeof window === 'undefined' || !pixelId || pixelId.trim() === '') {
      return false;
    }

    const cleanId = pixelId.trim();

    // Verify marketing consent
    if (!consentManager.isMarketingAllowed()) {
      console.log('[Meta Pixel] Initialisation différée : En attente du consentement marketing.');
      return false;
    }

    // Already initialized with same ID
    if (this.isInitialized && this.currentPixelId === cleanId && window.fbq) {
      return true;
    }

    this.currentPixelId = cleanId;

    try {
      if (!window.fbq) {
        /* eslint-disable */
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          t.id = 'meta-pixel-script';
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
      }

      window.fbq('init', cleanId);
      this.isInitialized = true;
      console.log(`[Meta Pixel] Initialisé avec succès (ID: ${cleanId}${testMode ? ' - MODE TEST' : ''})`);
      return true;
    } catch (err) {
      console.error('[Meta Pixel] Erreur d initialisation:', err);
      return false;
    }
  }

  /**
   * Track standard or custom event
   */
  public track(data: TrackingEventData): boolean {
    if (typeof window === 'undefined') return false;

    // Check consent
    if (!consentManager.isMarketingAllowed()) {
      return false;
    }

    if (!window.fbq) {
      return false;
    }

    const { eventName, eventId, contentId, contentName, category, value, currency, searchQuery } = data;

    const payload: Record<string, any> = {};
    if (contentId) payload.content_ids = [contentId];
    if (contentName) payload.content_name = contentName;
    if (category) payload.content_category = category;
    if (value !== undefined) payload.value = value;
    if (currency) payload.currency = currency;
    if (searchQuery) payload.search_string = searchQuery;

    // Deduplication event ID
    const options: Record<string, any> = {};
    if (eventId) {
      options.eventID = eventId;
    }

    try {
      if (Object.keys(options).length > 0) {
        window.fbq('track', eventName, payload, options);
      } else {
        window.fbq('track', eventName, payload);
      }
      return true;
    } catch (err) {
      console.error(`[Meta Pixel] Erreur lors du tracking de ${eventName}:`, err);
      return false;
    }
  }

  public isLoaded(): boolean {
    return typeof window !== 'undefined' && Boolean(window.fbq) && this.isInitialized;
  }
}

export const metaPixel = new MetaPixelService();
