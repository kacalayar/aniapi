import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractEpisodesList(id, baseUrl = v1_base_url) {
  try {
    const showId = id.split("-").pop();
    const response = await axios.get(
      `https://${baseUrl}/ajax/episode/list/${showId}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `https://${baseUrl}/watch/${id}`,
        },
      }
    );
    if (!response.data.html) return [];
    const $ = cheerio.load(response.data.html);
    const res = {
      totalEpisodes: 0,
      episodes: [],
    };
    const episodeElements = $(".episodes-ul a.ep-item");
    res.totalEpisodes = Number(episodeElements.length);
    episodeElements.each((_, el) => {
      const href = $(el)?.attr("href") || "";
      const epId = href.split("?ep=").pop() || $(el).attr("data-id") || null;
      res.episodes.push({
        episode_no: Number($(el).attr("data-number")),
        id: href.replace(/^\/+/, "").replace(/^watch\//, "") || null,
        title: $(el)?.attr("title")?.trim() || null,
        japanese_title: $(el).find(".ep-name").attr("data-jname") || null,
        filler: $(el).hasClass("ssl-item-filler"),
      });
    });
    return res;
  } catch (error) {
    console.error(error);
    return [];
  }
}
export default extractEpisodesList;
