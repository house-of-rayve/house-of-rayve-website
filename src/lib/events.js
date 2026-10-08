import "server-only";
import { EventEmitter } from "node:events";

// In-process event bus that powers the live admin dashboard (SSE).
const globalForEvents = globalThis;

export const bus = globalForEvents.__rayveBus ?? new EventEmitter();
bus.setMaxListeners(100);
if (!globalForEvents.__rayveBus) globalForEvents.__rayveBus = bus;

export function publish(type, data = {}) {
  bus.emit("event", { type, data, at: new Date().toISOString() });
}
