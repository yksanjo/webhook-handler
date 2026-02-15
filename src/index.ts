/**
 * Webhook Handler
 * 
 * Standalone library for handling security webhooks and callbacks.
 */

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface WebhookHandlerConfig {
  event: string;
  callback: (payload: WebhookPayload) => Promise<void> | void;
}

export class WebhookHandler {
  private handlers: Map<string, WebhookHandlerConfig[]>;

  constructor() {
    this.handlers = new Map();
  }

  register(event: string, callback: (payload: WebhookPayload) => Promise<void> | void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push({ event, callback });
  }

  async handle(payload: WebhookPayload): Promise<void> {
    const handlers = this.handlers.get(payload.event) || [];
    for (const handler of handlers) {
      try {
        await handler.callback(payload);
      } catch (e) {
        console.error(`Webhook handler error for ${payload.event}:`, e);
      }
    }
  }

  unregister(event: string, callback: (payload: WebhookPayload) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(event, handlers.filter(h => h.callback !== callback));
    }
  }

  listEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export default WebhookHandler;
