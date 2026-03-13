import axios from "axios";
import CryptoJS from "crypto-js";
import * as cheerio from "cheerio";
import { v1_base_url } from "../../utils/base_v1.js";
import { v4_base_url } from "../../utils/base_v4.js";
import { fallback_1, fallback_2 } from "../../utils/fallback.js";

function fetch_key(data) {
  let key = null;

  const xyMatch = data.match(/window\._xy_ws\s*=\s*["']([^"']+)["']/);
  if (xyMatch) {
    key = xyMatch[1];
  }

  if (!key) {
    const lkMatch = data.match(/window\._lk_db\s*=\s*\{([^}]+)\}/);

    if (lkMatch) {
      key = [...lkMatch[1].matchAll(/:\s*["']([^"']+)["']/g)]
        .map((v) => v[1])
        .join("");
    }
  }

  if (!key) {
    const nonceMatch = data.match(/nonce\s*=\s*["']([^"']+)["']/);
    if (nonceMatch) {
      key = nonceMatch[1];
    }
  }

  if (!key) {
    const dpiMatch = data.match(/data-dpi\s*=\s*["']([^"']+)["']/);
    if (dpiMatch) {
      key = dpiMatch[1];
    }
  }

  if (!key) {
    const metaMatch = data.match(
      /<meta[^>]*name\s*=\s*["']_gg_fb["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    );
    if (metaMatch) {
      key = metaMatch[1];
    }
  }

  if (!key) {
    const isThMatch = data.match(/_is_th\s*:\s*([A-Za-z0-9]+)/);
    if (isThMatch) {
      key = isThMatch[1];
    }
  }

  return key;
}

export async function decryptSources_v1(epID, id, name, type, fallback, baseUrl = v1_base_url) {
  try {
    let decryptedSources = null;
    let iframeURL = null;

    if (fallback) {
      const fallback_server = ["vidstreaming", "douvideo"].includes(
        name.toLowerCase(),
      )
        ? fallback_1
        : fallback_2;

      iframeURL = `https://${fallback_server}/stream/s-2/${epID}/${type}`;

      const { data } = await axios.get(
        `https://${fallback_server}/stream/s-2/${epID}/${type}`,
        {
          headers: {
            Referer: `https://${fallback_server}/`,
          },
        },
      );

      const $ = cheerio.load(data);
      const dataId = $("#megaplay-player").attr("data-id");
      const { data: decryptedData } = await axios.get(
        `https://${fallback_server}/stream/getSources?id=${dataId}`,
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );
      decryptedSources = decryptedData;
    } else {
      const { data: sourcesData } = await axios.get(
        `https://${baseUrl}/ajax/episode/sources?id=${id}`,
      );

      const ajaxLink = sourcesData?.link;
      if (!ajaxLink) throw new Error("Missing link in sourcesData");

      const sourceIdMatch = /\/([^/?]+)\?/.exec(ajaxLink);
      const sourceId = sourceIdMatch?.[1];
      if (!sourceId) throw new Error("Unable to extract sourceId from link");

      // Extract the base path from the embed link (e.g. https://rapid-cloud.co/embed-2/v2/e-1)
      const baseUrlMatch = ajaxLink.match(
        /^(https?:\/\/[^\/]+(?:\/[^\/]+){3})/,
      );
      if (!baseUrlMatch) throw new Error("Could not extract base URL");
      const baseUrl = baseUrlMatch[1];

      iframeURL = `${baseUrl}/${sourceId}?k=1&autoPlay=0&oa=0&asi=1`;

      const { data: rawSourceData } = await axios.get(
        `${baseUrl}/getSources?id=${sourceId}`,
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Referer: ajaxLink,
          },
        },
      );
      decryptedSources = rawSourceData;
    }

    return {
      id,
      type,
      link: {
        file: fallback
          ? (decryptedSources?.sources?.file ?? "")
          : (decryptedSources?.sources?.[0].file ?? ""),
        type: "hls",
      },
      tracks: decryptedSources.tracks ?? [],
      intro: decryptedSources.intro ?? null,
      outro: decryptedSources.outro ?? null,
      iframe: iframeURL,
      server: name,
    };
  } catch (error) {
    console.error(
      `Error during decryptSources_v1(${id}, epID=${epID}, server=${name}):`,
      error.message,
    );
    return null;
  }
}
