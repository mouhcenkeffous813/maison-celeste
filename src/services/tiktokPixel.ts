/**
 * TikTok Pixel Service
 * Handles standard TikTok pixel script injection, consent checks, and e-commerce event tracking.
 */

import { consentManager } from './consentManager';
import { TrackingEventData } from '../types/marketing';

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

class TikTokPixelService {
  private currentPixelId: string | null = null;
  private isInitialized = false;

  /**
   * Initialize TikTok Pixel script dynamically
   */
  public init(pixelId: string, testMode = false): boolean {
    if (typeof window === 'undefined' || !pixelId || pixelId.trim() === '') {
      return false;
    }

    const cleanId = pixelId.trim();

    // Verify consent
    if (!consentManager.isMarketingAllowed()) {
      console.log('[TikTok Pixel] Initialisation différée : En attente du consentement marketing.');
      return false;
    }

    if (this.isInitialized && this.currentPixelId === cleanId && window.ttq) {
      return true;
    }

    this.currentPixelId = cleanId;

    try {
      if (!window.ttq) {
        /* eslint-disable */
        (function (w: any, d: any, t: any) {
          w.TiktokAnalyticsObject = t;
          var ttq = (w[t] = w[t] || []);
          ttq.methods = [
            'page',
            'track',
            'identify',
            'instances',
            'debug',
            'on',
            'off',
            'once',
            'ready',
            'alias',
            'group',
            'enableCookie',
            'disableCookie',
          ];
          ttq.setAndDefer = function (t: any, e: any) {
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (var i = 0; i < ttq.methods.length; i++) {
            ttq.setAndDefer(ttq, ttq.methods[i]);
          }
          ttq.instance = function (t: any) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
              ttq.setAndDefer(e, ttq.methods[n]);
            }
            return e;
          };
          ttq.load = function (e: any, n: any) {
            var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            (ttq._i = ttq._i || {}),
              (ttq._i[e] = []),
              (ttq._i[e]._u = i),
              (ttq._t = ttq._t || {}),
              (ttq._t[e] = +new Date()),
              (ttq._o = ttq._o || {}),
              (ttq._o[e] = n || {});
            var o = document.createElement('script');
            (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
            o.id = 'tiktok-pixel-script';
            var a = document.getElementsByTagName('script')[0];
            a.parentNode?.insertBefore(o, a);
          };
        })(window, document, 'ttq');
        /* eslint-enable */
      }

      window.ttq.load(cleanId);
      window.ttq.page();
      this.isInitialized = true;
      console.log(`[TikTok Pixel] Initialisé avec succès (ID: ${cleanId}${testMode ? ' - MODE TEST' : ''})`);
      return true;
    } catch (err) {
      console.error('[TikTok Pixel] Erreur d initialisation:', err);
      return false;
    }
  }

  /**
   * Map standard event to TikTok event naming
   */
  private mapEventName(eventName: TrackingEventData['eventName']): string {
    switch (eventName) {
      case 'PageView':
        return 'PageView';
      case 'ViewContent':
        return 'ViewContent';
      case 'AddToCart':
        return 'AddToCart';
      case 'InitiateCheckout':
        return 'InitiateCheckout';
      case 'Purchase':
        return 'CompletePayment'; // TikTok uses CompletePayment
      case 'Search':
        return 'Search';
      default:
        return eventName;
    }
  }

  /**
   * Track event on TikTok
   */
  public track(data: TrackingEventData): boolean {
    if (typeof window === 'undefined') return false;

    // Check consent
    if (!consentManager.isMarketingAllowed()) {
      return false;
    }

    if (!window.ttq) {
      return false;
    }

    const ttEventName = this.mapEventName(data.eventName);

    const payload: Record<string, any> = {};
    if (data.contentId) payload.content_id = data.contentId;
    if (data.contentName) payload.content_name = data.contentName;
    if (data.category) payload.content_category = data.category;
    if (data.value !== undefined) payload.value = data.value;
    if (data.currency) payload.currency = data.currency;
    if (data.quantity) payload.quantity = data.quantity;
    if (data.searchQuery) payload.query = data.searchQuery;

    // Event ID for deduplication
    const options: Record<string, any> = {};
    if (data.eventId) {
      options.event_id = data.eventId;
    }

    try {
      if (Object.keys(options).length > 0) {
        window.ttq.track(ttEventName, payload, options);
      } else {
        window.ttq.track(ttEventName, payload);
      }
      return true;
    } catch (err) {
      console.error(`[TikTok Pixel] Erreur lors du tracking de ${ttEventName}:`, err);
      return false;
    }
  }

  public isLoaded(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ttq) && this.isInitialized;
  }
}

export const tikTokPixel = new TikTokPixelService();
