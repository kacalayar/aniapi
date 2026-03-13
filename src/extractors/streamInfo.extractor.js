import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
import { decryptSources_v1 } from "../parsers/decryptors/decrypt_v1.decryptor.js";

// Backward-compat mapping: old API names → current site names
const SERVER_NAME_MAP = {
  "hd-1": "vidstreaming",
  "hd-2": "vidcloud",
};

export async function extractServers(id, baseUrl = v1_base_url) {
  try {
    const resp = await axios.get(
      `https://${baseUrl}/ajax/episode/servers?episodeId=${id}`
    );
    const $ = cheerio.load(resp.data.html);
    const serverData = [];
    $(".server-item").each((index, element) => {
      const data_id = $(element).attr("data-id");
      const server_id = $(element).attr("data-server-id");
      const type = $(element).attr("data-type");

      const serverName = $(element).find("a").text().trim();
      serverData.push({
        type,
        data_id,
        server_id,
        serverName,
      });
    });
    return serverData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function extractStreamingInfo(id, name, type, fallback, baseUrl = v1_base_url) {
  try {
    const servers = await extractServers(id.split("?ep=").pop(), baseUrl);
    // Resolve legacy server names (hd-1 → vidstreaming, hd-2 → vidcloud)
    const resolvedName = (
      SERVER_NAME_MAP[name.toLowerCase()] ?? name
    ).toLowerCase();

    let requestedServer = servers.filter(
      (server) =>
        server.serverName.toLowerCase() === resolvedName &&
        server.type.toLowerCase() === type.toLowerCase()
    );
    if (requestedServer.length === 0) {
      requestedServer = servers.filter(
        (server) =>
          server.serverName.toLowerCase() === resolvedName &&
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
      fallback,
      baseUrl
    );
    return { streamingLink, servers };
  } catch (error) {
    console.error("An error occurred:", error);
    return { streamingLink: [], servers: [] };
  }
}
export { extractStreamingInfo };
