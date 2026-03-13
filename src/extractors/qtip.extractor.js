import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractQtip(id, baseUrl = v1_base_url) {
  try {
    const { data } = await axios.get(
      `https://${baseUrl}/ajax/movie/qtip/${id}`,
      {
        headers: {
          "x-requested-with": "XMLHttpRequest",
        },
      }
    );
    const $ = cheerio.load(data);

    // Helper to get value from .pre-qtip-line rows (9anime format)
    const getLineValue = (label) => {
      const line = $(`.pre-qtip-line:contains('${label}')`);
      if (!line.length) return "";
      const clone = line.clone();
      clone.find(".stick").remove();
      return clone.text().trim();
    };

    const title = $(".pre-qtip-title").text().trim();
    const description = $(".pre-qtip-description").text().trim();

    // Rating: 9anime uses "Scores" line, kaido uses star icon in .pqd-li
    let rating = getLineValue("Scores") || null;
    if (!rating) {
      const ratingEl = $(".pqd-li .text-warning").parent();
      if (ratingEl.length) {
        rating = ratingEl.text().replace(/[^\d.]/g, "").trim() || null;
      }
    }
    if (!rating) {
      // Try first .pqd-li that looks like a number
      const firstPqd = $(".pqd-li").first().text().trim();
      const ratingMatch = firstPqd.match(/^[\d.]+$/);
      if (ratingMatch) rating = ratingMatch[0];
    }

    // Quality: 9anime doesn't have tick-quality in qtip, kaido does
    const quality = $(".tick-item.tick-quality").text().trim() || null;

    // Sub/Dub count: 9anime uses .badge.badge-sub, kaido uses .tick-item.tick-sub
    const subCount = $(".badge.badge-sub").text().trim() ||
      $(".tick-item.tick-sub").text().trim().replace(/[^\d]/g, "") || null;
    const dubCount = $(".badge.badge-dub").text().trim() ||
      $(".tick-item.tick-dub").text().trim().replace(/[^\d]/g, "") || null;

    // Episode count: 9anime uses first .pqd-li "Episode 1155", kaido may not have it
    const epsText = $(".pqd-li").first().text().trim();
    let episodeCount = null;
    const epsMatch = epsText.match(/Episode\s*(\d+)/i);
    if (epsMatch) {
      episodeCount = epsMatch[1];
    } else {
      // Kaido: episode count might be in .tick-sub text like "1155"
      const subText = $(".tick-item.tick-sub").text().trim().replace(/[^\d]/g, "");
      if (subText) episodeCount = subText;
    }

    // Type: 9anime uses .badge.badge-type, kaido uses .badge-quality (confusingly named)
    let type = $(".badge.badge-type").text().trim() || null;
    if (!type) {
      type = $(".badge.badge-quality").text().trim() || null;
    }
    if (!type) {
      // Try .pqd-li.badge at the end
      $(".pqd-li.badge").each((_, el) => {
        const text = $(el).text().trim();
        if (["TV", "TV Series", "Movie", "OVA", "ONA", "Special"].some(t => text.includes(t))) {
          type = text;
        }
      });
    }

    const japaneseTitle = getLineValue("Japanese") || null;
    const Synonyms = getLineValue("Other names") || null;
    const airedDate = getLineValue("Date aired") || null;
    const status = getLineValue("Status") || null;

    const genres = [];
    $(`.pre-qtip-line:contains('Genre') a`).each((i, elem) => {
      genres.push($(elem).text().trim());
    });

    const watchLink = $(".pre-qtip-button a.btn.btn-play").attr("href") || null;

    return {
      title,
      rating,
      quality,
      subCount,
      dubCount,
      episodeCount,
      type,
      description,
      japaneseTitle,
      Synonyms,
      airedDate,
      status,
      genres,
      watchLink,
    };
  } catch (error) {
    console.error("Error extracting qtip data:", error.message);
    return null;
  }
}
