import axios from "axios";

async function testApiStructure() {
  console.log("Testing API structure across different base URLs...\n");

  const baseUrls = [
    "animekai.to",
    "kaido.to",
    "anikototv.to",
    "9animetv.to"
  ];

  const episodeId = "124262";

  for (const baseUrl of baseUrls) {
    console.log(`\n--- Testing ${baseUrl} ---`);
    
    // Test ajax/v2/episode/servers
    try {
      const url = `https://${baseUrl}/ajax/v2/episode/servers?episodeId=${episodeId}`;
      console.log(`URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 5000
      });
      console.log(`✓ Status: ${response.status}`);
      console.log(`Response structure:`, JSON.stringify(response.data, null, 2).substring(0, 200));
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
    }
  }
}

testApiStructure();
