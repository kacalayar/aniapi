/**
 * Base URL configuration for provider fallback.
 *
 * This file is kept for reference. The actual fallback logic
 * is now handled by the provider system in src/providers/index.js.
 *
 * Provider fallback order:
 *   1. 9anime (9animetv.to) - primary
 *   2. kaido (kaido.to) - fallback
 *
 * If the primary provider fails (network error, empty response),
 * the system automatically tries the next provider.
 */

export const BASE_URLS = [
  "9animetv.to",    // primary (9anime provider)
  "kaido.to",       // fallback (kaido provider)
  "anikai.to",      // potential future provider
  "anikototv.to",   // potential future provider
];
