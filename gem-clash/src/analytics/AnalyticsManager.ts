/**
 * Gem Clash -- AnalyticsManager
 * Owner: Data Scientist / Frontend Lead Engineer
 * Task: Analytics Tracking Spec Phase 1
 *
 * Centralized analytics event logging with:
 * - Data quality validation (no null/undefined required properties)
 * - Duplicate event detection (same event + params within 1 second)
 * - Type-safe event interfaces for all Phase 1 events
 * - Mock mode graceful handling via JestSDKWrapper
 */

import { Logger } from '../utils/Logger';
import { JestSDKWrapper } from '../sdk/JestSDKWrapper';

const log = new Logger('AnalyticsManager');

// ============================================================
// EVENT INTERFACES
// ============================================================

/** Base interface for all analytics events */
interface BaseAnalyticsEvent {
  eventName: string;
  params: Record<string, string | number | boolean>;
}

/** app_loaded - Fires when Phaser game instance is created */
export interface AppLoadedEvent extends BaseAnalyticsEvent {
  eventName: 'app_loaded';
  params: {
    load_time_ms: number;
    sdk_version: string;
    is_guest: boolean;
    phaser_version: string;
    viewport_width?: number;
    viewport_height?: number;
    user_agent?: string;
  };
}

/** session_started - Fires when player enters MainMenuScene */
export interface SessionStartedEvent extends BaseAnalyticsEvent {
  eventName: 'session_started';
  params: {
    is_returning: boolean;
    current_level: number;
    total_stars: number;
    lives_remaining: number;
    days_since_last_session?: number;
    has_incomplete_level?: boolean;
  };
}

/** level_started - Fires when player starts a level */
export interface LevelStartedEvent extends BaseAnalyticsEvent {
  eventName: 'level_started';
  params: {
    level_id: number;
    moves_available: number;
    difficulty: string;
    gem_colors: number;
    attempt_number: number;
    special_gems_enabled?: string;
    previous_best_stars?: number;
    lives_before_start?: number;
  };
}

/** level_completed - Fires when player wins a level */
export interface LevelCompletedEvent extends BaseAnalyticsEvent {
  eventName: 'level_completed';
  params: {
    level_id: number;
    score: number;
    stars: number;
    moves_used: number;
    moves_remaining: number;
    duration_seconds: number;
    cascades: number;
    specials_created?: number;
    specials_activated?: number;
    best_combo?: number;
    purchased_extra_moves?: boolean;
  };
}

/** level_failed - Fires when player fails a level */
export interface LevelFailedEvent extends BaseAnalyticsEvent {
  eventName: 'level_failed';
  params: {
    level_id: number;
    score: number;
    moves_used: number;
    duration_seconds: number;
    closest_star_threshold: number;
    score_deficit?: number;
    cascades?: number;
    specials_created?: number;
    fail_modal_type?: string;
    purchased_extra_moves?: boolean;
  };
}

/** purchase_started - Fires when purchase flow begins */
export interface PurchaseStartedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_started';
  params: {
    sku: string;
    price: number;
    trigger_point: string;
    level_id?: number;
    lives_remaining?: number;
    player_registered?: boolean;
  };
}

/** purchase_completed - Fires when purchase succeeds */
export interface PurchaseCompletedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_completed';
  params: {
    sku: string;
    price: number;
    purchase_token_prefix: string;
    level_id?: number;
    time_to_complete_ms?: number;
    verification_method?: string;
  };
}

/** purchase_failed - Fires when purchase fails */
export interface PurchaseFailedEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_failed';
  params: {
    sku: string;
    error_type: string;
    error_message: string;
    level_id?: number;
    time_to_fail_ms?: number;
  };
}

/** purchase_cancelled - Fires when user cancels purchase */
export interface PurchaseCancelledEvent extends BaseAnalyticsEvent {
  eventName: 'purchase_cancelled';
  params: {
    sku: string;
    trigger_point: string;
    time_to_cancel_ms?: number;
    level_id?: number;
  };
}

/** Union type of all Phase 1 events */
export type Phase1AnalyticsEvent =
  | AppLoadedEvent
  | SessionStartedEvent
  | LevelStartedEvent
  | LevelCompletedEvent
  | LevelFailedEvent
  | PurchaseStartedEvent
  | PurchaseCompletedEvent
  | PurchaseFailedEvent
  | PurchaseCancelledEvent;

// ============================================================
// ANALYTICS MANAGER CLASS
// ============================================================

export class AnalyticsManager {
  private static instance: AnalyticsManager | null = null;

  /** Duplicate detection cache: eventName+params hash -> timestamp */
  private recentEvents: Map<string, number> = new Map();

  /** Duplicate detection window (milliseconds) */
  private readonly DUPLICATE_WINDOW_MS = 1000;

  private constructor() {
    log.info('constructor', 'AnalyticsManager singleton created');
  }

  /** Get singleton instance */
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Log an analytics event with validation and duplicate detection.
   * This method is fire-and-forget -- analytics failures should not break gameplay.
   */
  async logEvent(event: Phase1AnalyticsEvent): Promise<void> {
    try {
      // 1. Validate required properties are not null/undefined
      this.validateEvent(event);

      // 2. Check for duplicate events
      if (this.isDuplicate(event)) {
        log.warn('logEvent', 'Duplicate event detected, skipping', {
          eventName: event.eventName,
        });
        return;
      }

      // 3. Auto-inject timestamp
      const enrichedParams = {
        ...event.params,
        event_timestamp: Date.now(),
      };

      // 4. Log via SDK wrapper (handles mock mode gracefully)
      const sdk = JestSDKWrapper.getInstance();
      await sdk.logEvent({
        eventName: event.eventName,
        params: enrichedParams,
      });

      // 5. Update duplicate detection cache
      this.markEventSent(event);

      log.info('logEvent', `Event logged: ${event.eventName}`, {
        params: event.params,
      });
    } catch (err) {
      log.error('logEvent', 'Failed to log analytics event', err);
      // DO NOT throw -- analytics failures should not break gameplay
    }
  }

  /**
   * Convenience method for app_loaded event.
   */
  async trackAppLoaded(params: AppLoadedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'app_loaded',
      params,
    });
  }

  /**
   * Convenience method for session_started event.
   */
  async trackSessionStarted(params: SessionStartedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'session_started',
      params,
    });
  }

  /**
   * Convenience method for level_started event.
   */
  async trackLevelStarted(params: LevelStartedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'level_started',
      params,
    });
  }

  /**
   * Convenience method for level_completed event.
   */
  async trackLevelCompleted(params: LevelCompletedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'level_completed',
      params,
    });
  }

  /**
   * Convenience method for level_failed event.
   */
  async trackLevelFailed(params: LevelFailedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'level_failed',
      params,
    });
  }

  /**
   * Convenience method for purchase_started event.
   */
  async trackPurchaseStarted(params: PurchaseStartedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'purchase_started',
      params,
    });
  }

  /**
   * Convenience method for purchase_completed event.
   */
  async trackPurchaseCompleted(params: PurchaseCompletedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'purchase_completed',
      params,
    });
  }

  /**
   * Convenience method for purchase_failed event.
   */
  async trackPurchaseFailed(params: PurchaseFailedEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'purchase_failed',
      params,
    });
  }

  /**
   * Convenience method for purchase_cancelled event.
   */
  async trackPurchaseCancelled(params: PurchaseCancelledEvent['params']): Promise<void> {
    await this.logEvent({
      eventName: 'purchase_cancelled',
      params,
    });
  }

  /**
   * Validate that all required properties are present and not null/undefined.
   * Throws an error if validation fails.
   */
  private validateEvent(event: Phase1AnalyticsEvent): void {
    const params = event.params as Record<string, unknown>;

    // Get required fields for this event type
    const requiredFields = this.getRequiredFields(event.eventName);

    for (const field of requiredFields) {
      const value = params[field];
      if (value === null || value === undefined) {
        throw new Error(
          `Event ${event.eventName} has null/undefined required property: ${field}`,
        );
      }
    }
  }

  /**
   * Get the required fields for each event type.
   */
  private getRequiredFields(eventName: string): string[] {
    const requiredFieldsMap: Record<string, string[]> = {
      app_loaded: ['load_time_ms', 'sdk_version', 'is_guest', 'phaser_version'],
      session_started: ['is_returning', 'current_level', 'total_stars', 'lives_remaining'],
      level_started: ['level_id', 'moves_available', 'difficulty', 'gem_colors', 'attempt_number'],
      level_completed: [
        'level_id', 'score', 'stars', 'moves_used',
        'moves_remaining', 'duration_seconds', 'cascades',
      ],
      level_failed: [
        'level_id', 'score', 'moves_used',
        'duration_seconds', 'closest_star_threshold',
      ],
      purchase_started: ['sku', 'price', 'trigger_point'],
      purchase_completed: ['sku', 'price', 'purchase_token_prefix'],
      purchase_failed: ['sku', 'error_type', 'error_message'],
      purchase_cancelled: ['sku', 'trigger_point'],
    };

    return requiredFieldsMap[eventName] || [];
  }

  /**
   * Check if this event is a duplicate (same eventName + params within 1 second).
   */
  private isDuplicate(event: Phase1AnalyticsEvent): boolean {
    const hash = this.hashEvent(event);
    const lastSent = this.recentEvents.get(hash);

    if (lastSent && Date.now() - lastSent < this.DUPLICATE_WINDOW_MS) {
      return true;
    }

    return false;
  }

  /**
   * Mark event as sent for duplicate detection.
   */
  private markEventSent(event: Phase1AnalyticsEvent): void {
    const hash = this.hashEvent(event);
    this.recentEvents.set(hash, Date.now());

    // Clean up old entries (older than 2x duplicate window)
    const cutoff = Date.now() - this.DUPLICATE_WINDOW_MS * 2;
    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (timestamp < cutoff) {
        this.recentEvents.delete(key);
      }
    }
  }

  /**
   * Create a hash of event for duplicate detection.
   */
  private hashEvent(event: Phase1AnalyticsEvent): string {
    const sortedParams = Object.keys(event.params)
      .sort()
      .map((key) => `${key}=${(event.params as Record<string, unknown>)[key]}`)
      .join('&');

    return `${event.eventName}:${sortedParams}`;
  }

  /**
   * Clear duplicate detection cache (for testing).
   */
  clearCache(): void {
    this.recentEvents.clear();
    log.debug('clearCache', 'Duplicate detection cache cleared');
  }

  /**
   * Reset singleton instance (for testing).
   */
  static resetInstance(): void {
    AnalyticsManager.instance = null;
  }
}
