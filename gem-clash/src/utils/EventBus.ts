/**
 * Gem Link — EventBus Utility
 * Owner: Frontend Lead Engineer
 * Task: TASK-002
 *
 * Simple typed event emitter for cross-module communication.
 * Uses the GameEvent enum from shared types as event keys.
 */

import { Logger } from './Logger';

const logger = new Logger('EventBus');

type EventCallback = (...args: unknown[]) => void;

interface EventSubscription {
  callback: EventCallback;
  context: unknown;
}

class EventBusImpl {
  private listeners: Map<string, EventSubscription[]> = new Map();

  /**
   * Subscribe to an event.
   * Returns an unsubscribe function for easy cleanup.
   */
  on(event: string, callback: EventCallback, context?: unknown): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const subscription: EventSubscription = { callback, context };
    this.listeners.get(event)!.push(subscription);

    logger.debug('on', `Subscribed to "${event}"`, {
      totalListeners: this.listeners.get(event)!.length,
    });

    // Return unsubscribe function
    return () => {
      this.off(event, callback, context);
    };
  }

  /**
   * Unsubscribe from an event.
   */
  off(event: string, callback: EventCallback, context?: unknown): void {
    const subs = this.listeners.get(event);
    if (!subs) return;

    const filtered = subs.filter(
      (sub) => sub.callback !== callback || sub.context !== context
    );

    if (filtered.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, filtered);
    }

    logger.debug('off', `Unsubscribed from "${event}"`, {
      remainingListeners: filtered.length,
    });
  }

  /**
   * Emit an event with optional arguments.
   */
  emit(event: string, ...args: unknown[]): void {
    const subs = this.listeners.get(event);
    if (!subs || subs.length === 0) {
      logger.debug('emit', `No listeners for "${event}"`);
      return;
    }

    logger.debug('emit', `Emitting "${event}" to ${subs.length} listener(s)`);

    for (const sub of subs) {
      try {
        sub.callback.apply(sub.context, args);
      } catch (err: unknown) {
        logger.error('emit', `Error in listener for "${event}"`, err);
      }
    }
  }

  /**
   * Subscribe to an event, but auto-unsubscribe after the first emission.
   */
  once(event: string, callback: EventCallback, context?: unknown): () => void {
    const wrappedCallback: EventCallback = (...args: unknown[]) => {
      this.off(event, wrappedCallback, context);
      callback.apply(context, args);
    };

    return this.on(event, wrappedCallback, context);
  }

  /**
   * Remove all listeners for a specific event, or all events if none specified.
   */
  removeAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      logger.debug('removeAll', `Removed all listeners for "${event}"`);
    } else {
      this.listeners.clear();
      logger.debug('removeAll', 'Removed all event listeners');
    }
  }
}

/** Singleton EventBus instance */
export const EventBus = new EventBusImpl();
