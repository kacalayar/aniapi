import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractSpotlights() {
  try {
    const resp = await axios.get(`https://${v1_base_url}/home`);
    const $ = cheerio.load(resp.data);

    const slideElements = $("div#slider .swiper-wrapper .swiper-slide");

    const promises = slideElements
      .map(async (ind, ele) => {
        const poster = $(ele)
          .find(".deslide-item .deslide-cover .deslide-cover-img img.film-poster-img")
          .attr("src") ||
          $(ele)
          .find(".deslide-item .deslide-cover .deslide-cover-img img.film-poster-img")
          .attr("data-src");
        const title = $(ele)
          .find(".deslide-item .deslide-item-content .desi-head-title")
          .text()
          .trim();
        const japanese_title = $(ele)
          .find(".deslide-item .deslide-item-content .desi-head-title a")
          .attr("data-jname")?.trim() || null;
        const description = $(ele)
          .find(".deslide-item .deslide-item-content .desi-description")
          .text()
          .trim();
        const href = $(ele)
          .find(".deslide-item .deslide-item-content .desi-buttons a:eq(0)")
          .attr("href") || "";
        const id = href.replace(/^\/watch\//, "").replace(/^\//, "") || null;
        const data_id = id ? id.split("-").pop() : null;

        return {
          id,
          data_id,
          poster,
          title,
          japanese_title,
          description,
        };
      })
      .get();

    const serverData = await Promise.all(promises);
    return JSON.parse(JSON.stringify(serverData, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return error;
  }
}

export default extractSpotlights;
