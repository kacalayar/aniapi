import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
// import decryptMegacloud from "../parsers/decryptors/megacloud.decryptor.js";
// import AniplayExtractor from "../parsers/aniplay.parser.js";
import { decryptSources_v1 } from "../parsers/decryptors/decrypt_v1.decryptor.js";

export async function extractServers(id) {
  try {
    // Try kaido.to style endpoint first (without v2)
    let resp;
    try {
      resp = await axios.get(
        `https://${v1_base_url}/ajax/episode/servers?episodeId=${id}`,
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `https://${v1_base_url}/`,
          },
        }
      );
      if (!resp.data?.html) throw new Error("No HTML in response");
    } catch (e) {
      // Fallback to v2 endpoint
      resp = await axios.get(
        `https://${v1_base_url}/ajax/v2/episode/servers?episodeId=${id}`,
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `https://${v1_base_url}/`,
          },
        }
      );
    }
    
    const $ = cheerio.load(resp.data.html);
    const serverData = [];
    
    // Try multiple selectors for server items
    let serverItems = $(".server-item");
    if (serverItems.length === 0) {
      serverItems = $(".servers-sub .btn-play, .servers-dub .btn-play, .servers-raw .btn-play");
    }
    
    serverItems.each((index, element) => {
      const data_id = $(element).attr("data-id") || $(element).attr("data-link-id");
      const server_id = $(element).attr("data-server-id") || $(element).attr("data-sv-id");
      const type = $(element).attr("data-type") || 
                   ($(element).closest(".servers-sub").length ? "sub" : 
                    $(element).closest(".servers-dub").length ? "dub" : "raw");

      const serverName = $(element).find("a").text().trim() || $(element).text().trim();
      if (data_id) {
        serverData.push({
          type,
          data_id,
          server_id,
          serverName,
        });
      }
      });
    return serverData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function extractStreamingInfo(id, name, type, fallback) {
  try {
    const servers = await extractServers(id.split("?ep=").pop());
    let requestedServer = servers.filter(
      (server) =>
        server.serverName.toLowerCase() === name.toLowerCase() &&
        server.type.toLowerCase() === type.toLowerCase()
    );
    if (requestedServer.length === 0) {
      requestedServer = servers.filter(
        (server) =>
          server.serverName.toLowerCase() === name.toLowerCase() &&
          server.type.toLowerCase() === "raw"
      );
    }
    if (requestedServer.length === 0) {
      throw new Error(
        `No matching server found for name: ${name}, type: ${type}`
      );
    }
    const streamingLink = await decryptSources_v1(
      id,
      requestedServer[0].data_id,
      name,
      type,
      fallback
    );
    return { streamingLink, servers };
  } catch (error) {
    console.error("An error occurred:", error);
    return { streamingLink: [], servers: [] };
  }
}
export { extractStreamingInfo };
