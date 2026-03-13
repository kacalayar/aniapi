import { tryWithFallback } from "./src/utils/baseFallback.js";
import axios from "axios";

async function testFallback() {
  console.log("Testing base URL fallback mechanism...\n");

  try {
    const result = await tryWithFallback(async (baseUrl) => {
      console.log(`Trying with base URL: ${baseUrl}`);
      const response = await axios.get(
        `https://${baseUrl}/ajax/v2/episode/servers?episodeId=1`,
        { timeout: 5000 }
      );
      console.log(`✓ Success with ${baseUrl}\n`);
      return response;
    });

    console.log("Fallback test completed successfully!");
    console.log("Response status:", result.status);
  } catch (error) {
    console.error("All base URLs failed:", error.message);
  }
}

testFallback();
