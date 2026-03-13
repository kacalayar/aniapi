import axios from "axios";
import * as cheerio from "cheerio";

async function testEpisodeDebug() {
  const id = "captain-bal-13152";
  const baseUrl = "kaido.to";
  
  console.log(`Fetching: https://${baseUrl}/watch/${id}\n`);
  
  const response = await axios.get(`https://${baseUrl}/watch/${id}`);
  const $ = cheerio.load(response.data);
  
  // Get anime ID from page
  const animeId = $('[data-id]').first().attr('data-id');
  console.log(`Anime ID: ${animeId}`);
  
  // Try ajax endpoint for episode list
  if (animeId) {
    const ajaxUrl = `https://${baseUrl}/ajax/v2/episode/list/${animeId}`;
    console.log(`Ajax URL: ${ajaxUrl}`);
    
    const ajaxResponse = await axios.get(ajaxUrl, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://${baseUrl}/watch/${id}`,
      }
    });
    
    console.log(`Ajax response:`, JSON.stringify(ajaxResponse.data, null, 2).substring(0, 500));
  }
  
  // Try different ajax endpoint format
  const showId = id.split("-").pop();
  console.log(`\nShow ID from URL: ${showId}`);
  
  const ajaxUrl2 = `https://${baseUrl}/ajax/episode/list/${showId}`;
  console.log(`Ajax URL 2: ${ajaxUrl2}`);
  
  try {
    const ajaxResponse2 = await axios.get(ajaxUrl2, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://${baseUrl}/watch/${id}`,
      }
    });
    console.log(`Ajax response 2:`, JSON.stringify(ajaxResponse2.data, null, 2).substring(0, 500));
  } catch (e) {
    console.log(`Ajax 2 error: ${e.message}`);
  }
}

testEpisodeDebug();
