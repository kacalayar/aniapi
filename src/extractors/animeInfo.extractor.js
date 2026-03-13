import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../helper/formatTitle.helper.js";
import { v1_base_url } from "../utils/base_v1.js";
import extractRecommendedData from "./recommend.extractor.js";
import extractRelatedData from "./related.extractor.js";
import extractPopularData from "./popular.extractor.js";

async function extractAnimeInfo(id) {
  try {
    const [resp, characterData] = await Promise.all([
      axios.get(`https://${v1_base_url}/watch/${id}`),
      axios.get(
        `https://${v1_base_url}/ajax/character/list/${id.split("-").pop()}`
      ).catch(() => ({ data: { html: "" } })),
    ]);
    const characterHtml = characterData.data?.html || "";
    const $1 = cheerio.load(characterHtml);
    const $ = cheerio.load(resp.data);
    const data_id = id.split("-").pop();
    const titleElement = $(".anime-detail .film-name");
    const showType = $(".prebreadcrumb ol li")
      .eq(1)
      .find("a")
      .text()
      .trim();
    const posterElement = $(".anime-detail .film-poster");
    const tvInfo = {};
    $(".meta .item").each((_, element) => {
      const el = $(element);
      const key = el.find(".item-title").text().trim().replace(":", "");
      const value = el.find(".item-content").text().trim();
      if (key === "Quality") tvInfo.quality = value;
      else if (key === "Duration") tvInfo.duration = value;
      else if (key === "Type") tvInfo.showType = value;
    });

    const element = $(".meta .item");
    const overviewElement = $(".film-description .shorting");

    const title = titleElement.text().trim();
    const japanese_title = titleElement.attr("data-jname");
    const synonyms = $(".alias").text().trim();
    const poster = posterElement.find("img").attr("src");
    const syncDataScript = $("#syncData").html();
    let anilistId = null;
    let malId = null;

    if (syncDataScript) {
      try {
        const syncData = JSON.parse(syncDataScript);
        anilistId = syncData.anilist_id || null;
        malId = syncData.mal_id || null;
      } catch (error) {
        console.error("Error parsing syncData:", error);
      }
    }

    const animeInfo = {};
    element.each((_, el) => {
      const key = $(el).find(".item-title").text().trim().replace(":", "");
      const value =
        key === "Genre" || key === "Studios"
          ? $(el)
              .find(".item-content a")
              .map((_, a) => $(a).text().split(" ").join("-").trim())
              .get()
          : $(el).find(".item-content").text().split(" ").join("-").trim();
      animeInfo[key] = value;
    });

    const trailers = [];
    $('.block_area-promotions-list .screen-items .item').each((_, element) => {
      const el = $(element);
      const title = el.attr('data-title');
      const url = el.attr('data-src');
      if (url) {
        const fullUrl = url.startsWith('//') ? `https:${url}` : url;
        let videoId = null;
        const match = fullUrl.match(/\/embed\/([^?&]+)/);
        if (match && match[1]) {
          videoId = match[1];
        }
        trailers.push({
          title: title || null,
          url: fullUrl,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
        });
      }
    });
    animeInfo.trailers = trailers;

    const season_id = formatTitle(title, data_id);
    animeInfo["Overview"] = overviewElement.text().trim();
    animeInfo["tvInfo"] = tvInfo;

    let adultContent = false;
    const tickRateText = $(".tick-rate", ".anime-detail").text().trim();
    if (tickRateText.includes("18+")) {
      adultContent = true;
    }

    const [recommended_data, related_data, popular_data] = await Promise.all([
      extractRecommendedData($),
      extractRelatedData($),
      extractPopularData($),
    ]);
    let charactersVoiceActors = [];
    if (characterHtml) {
      charactersVoiceActors = $1(".bac-list-wrap .bac-item")
        .map((index, el) => {
          const character = {
            id:
              $1(el)
                .find(".per-info.ltr .pi-avatar")
                .attr("href")
                ?.split("/")[2] || "",
            poster:
              $1(el).find(".per-info.ltr .pi-avatar img").attr("data-src") ||
              "",
            name: $1(el).find(".per-info.ltr .pi-detail a").text(),
            cast: $1(el).find(".per-info.ltr .pi-detail .pi-cast").text(),
          };

          let voiceActors = [];
          const rtlVoiceActors = $1(el).find(".per-info.rtl");
          const xxVoiceActors = $1(el).find(
            ".per-info.per-info-xx .pix-list .pi-avatar"
          );
          if (rtlVoiceActors.length > 0) {
            voiceActors = rtlVoiceActors
              .map((_, actorEl) => ({
                id: $1(actorEl).find("a").attr("href")?.split("/").pop() || "",
                poster: $1(actorEl).find("img").attr("data-src") || "",
                name:
                  $1(actorEl).find(".pi-detail .pi-name a").text().trim() || "",
              }))
              .get();
          } else if (xxVoiceActors.length > 0) {
            voiceActors = xxVoiceActors
              .map((_, actorEl) => ({
                id: $1(actorEl).attr("href")?.split("/").pop() || "",
                poster: $1(actorEl).find("img").attr("data-src") || "",
                name: $1(actorEl).attr("title") || "",
              }))
              .get();
          }
          if (voiceActors.length === 0) {
            voiceActors = $1(el)
              .find(".per-info.per-info-xx .pix-list .pi-avatar")
              .map((_, actorEl) => ({
                id: $1(actorEl).attr("href")?.split("/")[2] || "",
                poster: $1(actorEl).find("img").attr("data-src") || "",
                name: $1(actorEl).attr("title") || "",
              }))
              .get();
          }

          return { character, voiceActors };
        })
        .get();
    }

    return {
      adultContent,
      data_id,
      id: season_id,
      anilistId,
      malId,
      title,
      japanese_title,
      synonyms,
      poster,
      showType,
      animeInfo,
      charactersVoiceActors,
      recommended_data,
      related_data,
      popular_data,
    };
  } catch (e) {
    console.error("Error extracting anime info:", e);
  }
}

export default extractAnimeInfo;
