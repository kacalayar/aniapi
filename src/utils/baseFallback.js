export const BASE_URLS = [
  "kaido.to",         // v1
  "anikai.to",        // v1 fallback
  "anikototv.to",     // v3
  "9animetv.to"       // v4
];

export async function tryWithFallback(requestFn, validateResponse, maxRetries = BASE_URLS.length) {
  let lastError = null;
  
  for (let i = 0; i < maxRetries && i < BASE_URLS.length; i++) {
    try {
      const result = await requestFn(BASE_URLS[i]);
      
      // Validate response if validator provided
      if (validateResponse && !validateResponse(result)) {
        console.log(`Response validation failed for ${BASE_URLS[i]}`);
        continue;
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.log(`Failed with ${BASE_URLS[i]}, trying next...`);
    }
  }
  
  throw lastError || new Error("All base URLs failed");
}
