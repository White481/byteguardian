import "server-only";
import { HttpError } from "@/lib/api-response";

/**
 * Simple in-memory fixed-window limiter (per server process).
 * Good enough for dev and a single server; use Redis or similar when running several instances.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
  if (entry.count > limit) {
    const seconds = Math.ceil((entry.resetAt - now) / 1000);
    throw new HttpError(429, "RATE_LIMITED", `Too many requests — try again in ${seconds}s`);
  }
}
