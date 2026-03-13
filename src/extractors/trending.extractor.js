import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function fetchAnimeDetails(element) {
  const data_id = element.attr("data-id");
  const number = element.find(".number > span").text();
  const poster = element.find("img").attr("data-src") || element.find("img").attr("src");
  const title = element.find(".film-title").text().trim();
  const japanese_title = element.find(".film-title").attr("data-jname")?.trim() || null;
  const href = element.find("a").attr("href") || "";
  const id = href.replace(/^\/watch\//, "").replace(/^\//, "").split("/").pop();
  return { id, data_id, number, poster, title, japanese_title };
}

async function extractTrending(baseUrl = v1_base_url) {
  try {
    const resp = await axios.get(`https://${baseUrl}/home`);
    const $ = cheerio.load(resp.data);

    // Try the original selector first, then fallback alternatives
    let trendingElements = $("#anime-trending #trending-home .swiper-slide");
    if (!trendingElements.length) {
      trendingElements = $("[id*=trending] .swiper-slide");
    }

    if (!trendingElements.length) {
      // Trending section no longer exists on the home page
      return [];
    }

    const elementPromises = trendingElements
      .map((index, element) => {
        return fetchAnimeDetails($(element));
      })
      .get();

    const trendingData = await Promise.all(elementPromises);
    return JSON.parse(JSON.stringify(trendingData));
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return error;
  }
}

export default extractTrending;
