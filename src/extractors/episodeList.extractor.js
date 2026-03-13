import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractEpisodesList(id) {
  try {
    // Get episode list from watch page HTML
    const watchResponse = await axios.get(`https://${v1_base_url}/watch/${id}`);
    const $ = cheerio.load(watchResponse.data);
    
    const res = {
      totalEpisodes: 0,
      episodes: [],
    };
    
    // Try multiple selectors for episode list
    let episodeElements = $(".detail-infor-content .ss-list a");
    if (episodeElements.length === 0) {
      episodeElements = $(".ss-list a");
    }
    if (episodeElements.length === 0) {
      episodeElements = $(".episodes-list a");
    }
    
    res.totalEpisodes = episodeElements.length;
    
    episodeElements.each((_, el) => {
      res.episodes.push({
        episode_no: Number($(el).attr("data-number")),
        id: $(el)?.attr("href")?.split("/")?.pop() || null,
        title: $(el)?.attr("title")?.trim() || null,
        japanese_title: $(el).find(".ep-name").attr("data-jname"),
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
