/**
 * 9anime Provider (9animetv.to)
 *
 * Wraps existing extractors into the uniform provider interface.
 */

import extractSpotlights from "../../extractors/spotlight.extractor.js";
import extractTrending from "../../extractors/trending.extractor.js";
import extractTopTen from "../../extractors/topten.extractor.js";
import extractTopSearch from "../../extractors/topsearch.extractor.js";
import extractAnimeInfo from "../../extractors/animeInfo.extractor.js";
import extractEpisodeList from "../../extractors/episodeList.extractor.js";
import { extractStreamingInfo } from "../../extractors/streamInfo.extractor.js";
import extractSearchResults from "../../extractors/search.extractor.js";
import extractFilterResults from "../../extractors/filter.extractor.js";
import extractSuggestions from "../../extractors/suggestion.extractor.js";
import extractSchedule from "../../extractors/schedule.extractor.js";
import extractNextEpisodeSchedule from "../../extractors/getNextEpisodeSchedule.extractor.js";
import extractRandom from "../../extractors/random.extractor.js";
import extractRandomId from "../../extractors/randomId.extractor.js";
import extractQtip from "../../extractors/qtip.extractor.js";
import { extractor as extractCategory } from "../../extractors/category.extractor.js";
import { extractByStatus } from "../../helper/filterByStatus.helper.js";

const BASE = "9animetv.to";

export function createNineAnimeProvider() {
  return {
    name: "9anime",
    baseUrl: BASE,

    // ---- Home & Discovery ----
    async spotlight() {
      return extractSpotlights(BASE);
    },

    async trending() {
      return extractTrending(BASE);
    },

    async topTen() {
      return extractTopTen(BASE);
    },

    async topSearch() {
      return extractTopSearch(BASE);
    },

    // ---- Anime Details ----
    async info(id) {
      return extractAnimeInfo(id, BASE);
    },

    async episodes(id) {
      return extractEpisodeList(id, BASE);
    },

    async qtip(id) {
      return extractQtip(id, BASE);
    },

    // ---- Streaming ----
    async servers(id, ep) {
      return { id, ep };
    },

    async stream(id, name, type, fallback = false) {
      return extractStreamingInfo(id, name, type, fallback, BASE);
    },

    // ---- Search & Filter ----
    async search(params) {
      return extractSearchResults(params, BASE);
    },

    async filter(params) {
      return extractFilterResults(params, BASE);
    },

    async suggestion(keyword) {
      return extractSuggestions(keyword, BASE);
    },

    // ---- Schedule ----
    async schedule(date, tzOffset) {
      return extractSchedule(date, tzOffset, BASE);
    },

    async nextEpisodeSchedule(id) {
      return extractNextEpisodeSchedule(id, BASE);
    },

    // ---- Random ----
    async random() {
      return extractRandom(BASE);
    },

    async randomId() {
      return extractRandomId(BASE);
    },

    // ---- Browse / Category ----
    async category(routeType, page) {
      // Virtual routes that need qtip post-filtering
      const FILTER_ROUTES = ["top-airing", "ongoing", "completed", "top-upcoming"];
      if (FILTER_ROUTES.includes(routeType)) {
        return extractByStatus(routeType, page, 24, BASE);
      }
      // Fix known typo
      if (routeType === "genre/martial-arts") {
        routeType = "genre/marial-arts";
      }
      const { data, totalPages } = await extractCategory(routeType, page, BASE);
      return { data, totalPages };
    },

    // ---- Characters / Actors ----
    async characterList(id, page) {
      const { default: extractVoiceActor } = await import(
        "../../extractors/voiceactor.extractor.js"
      );
      return extractVoiceActor(id, page, BASE);
    },

    async character(id) {
      const { default: extractCharacter } = await import(
        "../../extractors/characters.extractor.js"
      );
      return extractCharacter(id, BASE);
    },

    async actor(id) {
      const { default: extractActor } = await import(
        "../../extractors/actors.extractor.js"
      );
      return extractActor(id, BASE);
    },

    // ---- Producer ----
    async producer(id, page) {
      const { default: extractPage } = await import(
        "../../helper/extractPages.helper.js"
      );
      const [data, totalPages] = await extractPage(page, `producer/${id}`, BASE);
      return { data, totalPages };
    },

    // ---- Watchlist ----
    async watchlist(userId, page) {
      const { default: extractWatchlist } = await import(
        "../../extractors/watchlist.extractor.js"
      );
      return extractWatchlist(userId, page, BASE);
    },
  };
}
