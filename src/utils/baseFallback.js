export const BASE_URLS = [
  "animekai.to",      // v1
  "kaido.to",         // v2
  "anikototv.to",     // v3
  "9animetv.to"       // v4
];

export async function tryWithFallback(requestFn, maxRetries = BASE_URLS.length) {
  let lastError = null;
  
  for (let i = 0; i < maxRetries && i < BASE_URLS.length; i++) {
    try {
      const result = await requestFn(BASE_URLS[i]);
      return result;
    } catch (error) {
      lastError = error;
      console.log(`Failed with ${BASE_URLS[i]}, trying next...`);
    }
  }
  
  throw lastError || new Error("All base URLs failed");
}
