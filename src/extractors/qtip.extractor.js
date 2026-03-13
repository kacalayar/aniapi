import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractQtip(id) {
  try {
    const { data } = await axios.get(
      `https://${v1_base_url}/ajax/movie/qtip/${id}`,
      {
        headers: {
          "x-requested-with": "XMLHttpRequest",
        },
      }
    );
    const $ = cheerio.load(data);

    const getLineValue = (label) => {
      const line = $(`.pre-qtip-line:contains('${label}')`);
      if (!line.length) return "";
      const clone = line.clone();
      clone.find(".stick").remove();
      return clone.text().trim();
    };

    const title = $(".pre-qtip-title").text().trim();
    const rating = getLineValue("Scores") || null;
    const quality = $(".tick-item.tick-quality").text().trim() || null;
    const subCount = $(".badge.badge-sub").text().trim() || null;
    const dubCount = $(".badge.badge-dub").text().trim() || null;

    const epsText = $(".pqd-li").first().text().trim();
    const episodeCount = epsText.replace(/^Episode\s*/i, "").trim() || null;

    const type = $(".badge.badge-type").text().trim() || null;
    const description = $(".pre-qtip-description").text().trim();
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
