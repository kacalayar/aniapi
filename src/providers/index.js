/**
 * Provider Registry with Automatic Fallback
 *
 * Each provider exports a uniform interface so controllers can call:
 *   const provider = getProvider("9anime");
 *   const results  = await provider.search({ keyword: "naruto", page: 1 });
 *
 * If a provider fails, the fallback wrapper automatically tries the next provider.
 *
 * Uniform interface (all methods are async):
 *
 *   home()                          → homepage data
 *   search(params)                  → [totalPage, results[]]
 *   filter(params)                  → [totalPage, results[], currentPage, hasNextPage]
 *   info(id)                        → anime detail object
 *   episodes(id)                    → { totalEpisodes, episodes[] }
 *   servers(id, ep)                 → server list
 *   stream(id, name, type, fallback)→ stream data
 *   schedule(date, tzOffset)        → schedule items[]
 *   nextEpisodeSchedule(id)         → next episode info
 *   topTen()                        → { today[], week[], month[] }
 *   topSearch()                     → top searched items[]
 *   random()                        → random anime detail
 *   randomId()                      → random anime slug
 *   qtip(id)                        → quick-tip data
 *   spotlight()                     → spotlight items[]
 *   trending()                      → trending items[]
 *   category(routeType, page)       → { data[], totalPages }
 *   suggestion(keyword)             → suggestion items[]
 *   characterList(id, page)         → character list
 *   character(id)                   → character detail
 *   actor(id)                       → actor detail
 *   producer(id, page)              → producer anime list
 *   watchlist(userId, page)         → watchlist items
 */

import { createNineAnimeProvider } from "./9anime/index.js";
import { createKaidoProvider } from "./kaido/index.js";

/**
 * Raw provider instances (no fallback wrapping).
 */
const rawProviders = {
  "9anime": createNineAnimeProvider(),
  "kaido": createKaidoProvider(),
};

/**
 * Fallback order: if 9anime fails, try kaido. If kaido fails, try 9anime.
 */
const FALLBACK_ORDER = {
  "9anime": ["9anime", "kaido"],
  "kaido":  ["kaido", "9anime"],
};

/**
 * All method names that should be wrapped with fallback logic.
 */
const PROVIDER_METHODS = [
  "spotlight", "trending", "topTen", "topSearch",
  "info", "episodes", "qtip",
  "servers", "stream",
  "search", "filter", "suggestion",
  "schedule", "nextEpisodeSchedule",
  "random", "randomId",
  "category",
  "characterList", "character", "actor",
  "producer", "watchlist",
];

/**
 * Validates that a provider response is not empty/falsy.
 */
function isValidResponse(result) {
  if (result === null || result === undefined) return false;
  if (Array.isArray(result) && result.length === 0) return false;
  if (typeof result === "object" && !Array.isArray(result)) {
    // Check for common empty patterns
    if (result.episodes && Array.isArray(result.episodes) && result.episodes.length === 0) return false;
    if (result.data && Array.isArray(result.data) && result.data.length === 0) return false;
  }
  return true;
}

/**
 * Creates a proxy provider that wraps each method with fallback logic.
 * If the primary provider throws or returns empty, it tries the next one.
 */
function createFallbackProvider(primaryName) {
  const order = FALLBACK_ORDER[primaryName] || [primaryName];
  const proxy = {
    name: primaryName,
    baseUrl: rawProviders[primaryName]?.baseUrl,
  };

  for (const method of PROVIDER_METHODS) {
    proxy[method] = async function (...args) {
      let lastError = null;

      for (const providerName of order) {
        const provider = rawProviders[providerName];
        if (!provider || typeof provider[method] !== "function") continue;

        try {
          const result = await provider[method](...args);

          // For certain methods, validate the response
          // (don't fallback for stream/servers which may legitimately return specific shapes)
          const skipValidation = ["servers", "stream", "nextEpisodeSchedule", "randomId"];
          if (!skipValidation.includes(method) && !isValidResponse(result)) {
            console.log(`[provider] ${providerName}.${method}() returned empty, trying next...`);
            continue;
          }

          return result;
        } catch (error) {
          lastError = error;
          console.log(`[provider] ${providerName}.${method}() failed: ${error.message}, trying next...`);
        }
      }

      // All providers failed
      if (lastError) throw lastError;
      throw new Error(`All providers failed for method: ${method}`);
    };
  }

  return proxy;
}

/**
 * Wrapped providers with fallback logic.
 */
const providers = {
  "9anime": createFallbackProvider("9anime"),
  "kaido":  createFallbackProvider("kaido"),
};

// Aliases
providers["9animetv"] = providers["9anime"];
providers["default"] = providers["9anime"];

/**
 * Get a provider by name.
 * @param {string} name - "9anime", "kaido", or "default"
 * @returns {object} provider with uniform interface + automatic fallback
 */
export function getProvider(name = "default") {
  const key = (name || "default").toLowerCase().trim();
  const provider = providers[key];
  if (!provider) {
    throw new Error(
      `Unknown provider: "${name}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return provider;
}

/**
 * List all available provider names (excluding aliases).
 */
export function listProviders() {
  return ["9anime", "kaido"];
}

export default { getProvider, listProviders };
