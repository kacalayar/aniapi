import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractNextEpisodeSchedule(id, baseUrl = v1_base_url) {
  try {
    const { data } = await axios.get(`https://${baseUrl}/watch/${id}`);
    const $ = cheerio.load(data);
    const nextEpisodeSchedule = $(
      ".schedule-alert > .alert.small > span:last"
    ).attr("data-value");
    return nextEpisodeSchedule;
  } catch (error) {
    console.error(error);
  }
}
