import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractTopTen(baseUrl = v1_base_url) {
  try {
    const resp = await axios.get(`https://${baseUrl}/home`);
    const $ = cheerio.load(resp.data);

    const labels = ["today", "week", "month"];
    const result = {};

    labels.forEach((label, idx) => {
      const data = $(
        `#main-sidebar .block_area-realtime .block_area-content ul:eq(${idx})>li`
      )
        .map((index, element) => {
          const number = $(".film-number>span", element).text().trim();
          const title = $(".film-detail>.film-name>a", element).text().trim();
          const poster = $(".film-poster>img", element).attr("data-src") ||
            $(".film-poster>img", element).attr("src");
          const japanese_title = $(".film-detail>.film-name>a", element)
            .attr("data-jname")
            ?.trim() || null;
          const data_id = $(".film-poster", element).attr("data-id");
          const href = $(".film-detail>.film-name>a", element).attr("href") || "";
          const id = href.replace(/^\/watch\//, "").replace(/^\//, "");

          // Views count from sidebar
          const views = $(".fd-infor .fdi-item", element).text().trim().replace(/[^\d,]/g, "") || null;

          return { id, data_id, number, title, japanese_title, poster, views };
        })
        .get();

      result[label] = data;
    });

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export default extractTopTen;
