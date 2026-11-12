/**
 * Marketing & Tracking Types for Meta & TikTok Pixels
 * Maison Céleste
 */

export interface PixelConfig {
  pixelId: string;
  enabled: boolean;
  testMode: boolean;
  trackEvents: boolean;
  lastTestedAt?: string;
  testStatus?: 'success' | 'error' | 'pending';
}

export interface MarketingConfig {
  meta: PixelConfig;
  tiktok: PixelConfig;
  requireConsent: boolean;
}

export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface ConsentPreferences {
  status: ConsentStatus;
  marketing: boolean;
  analytics: boolean;
  necessary: boolean;
  timestamp: string;
}

export interface TrackingEventData {
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Search';
  eventId?: string;
  contentId?: string;
  contentName?: string;
  category?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  searchQuery?: string;
  customData?: Record<string, any>;
}

export interface TrackedEventLog {
  id: string;
  eventName: string;
  platform: 'Meta' | 'TikTok' | 'Both';
  timestamp: string;
  details: string;
  status: 'sent' | 'blocked_consent' | 'disabled';
}
