import axios from "axios";

async function testEpisodeDebug() {
  const sourceId = "cQ0c56f8ZDbK";
  const embedUrl = `https://rapid-cloud.co/embed-2/v2/e-1/${sourceId}?z=`;
  
  console.log(`Testing getSources endpoints\n`);
  
  // Correct URL pattern
  const url = `https://rapid-cloud.co/embed-2/v2/e-1/getSources?id=${sourceId}`;
  console.log(`URL: ${url}`);
  
  try {
    const resp = await axios.get(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Referer": embedUrl
      }
    });
    console.log(`Success:`, JSON.stringify(resp.data, null, 2));
  } catch (e) {
    console.log(`Error: ${e.response?.status} - ${e.message}`);
  }
}

testEpisodeDebug();
