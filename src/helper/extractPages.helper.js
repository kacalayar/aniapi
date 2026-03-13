import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

const axiosInstance = axios.create({ headers: DEFAULT_HEADERS });

async function extractPage(page, params) {
  try {
    const resp = await axiosInstance.get(`https://${v1_base_url}/${params}?page=${page}`);
    const $ = cheerio.load(resp.data);
    const totalPages =
      Number(
        $('.pre-pagination nav .pagination > .page-item a[title="Last"]')
          ?.attr("href")
          ?.split("=")
          .pop() ??
          $('.pre-pagination nav .pagination > .page-item a[title="Next"]')
            ?.attr("href")
            ?.split("=")
            .pop() ??
          $(".pre-pagination nav .pagination > .page-item.active a")
            ?.text()
            ?.trim()
      ) || 1;
      
    const contentSelector = params.includes("az-list")
      ? ".tab-content"
      : "#main-content";
    const data = await Promise.all(
      $(`${contentSelector} .film_list-wrap .flw-item`).map(
        async (index, element) => {
          const poster = $(".film-poster>img", element).attr("data-src");
          const title = $(".film-detail .film-name", element).text();
          const japanese_title = $(".film-detail>.film-name>a", element).attr(
            "data-jname"
          );
          const description = $(".film-detail .description", element)
            .text()
            .trim();
          const data_id = $(element).attr("data-id") ||
            $(".film-poster>a", element).attr("data-id");
          const href = $(".film-poster>a", element).attr("href") || "";
          const id = href.replace(/^\/watch\//, "").replace(/^\//, "").split("?")[0] ||
            href.split("/").pop();

          // Episode info from "Ep 12/12" or "Ep Full" format
          const epsText = $(`.tick .tick-eps`, element).text().trim();
          const epsMatch = epsText.match(/Ep\s*(\d+)(?:\/(\d+))?/);
          const totalEps = epsMatch
            ? parseInt(epsMatch[2] || epsMatch[1], 10)
            : null;

          // Sub/Dub are boolean indicators now
          const hasSub = !!$(`.tick .tick-sub`, element).length;
          const hasDub = !!$(`.tick .tick-dub`, element).length;

          const tvInfo = {
            showType:
              $(".film-poster .tick-quality", element).text().trim() ||
              "Unknown",
            sub: hasSub ? (totalEps || true) : null,
            dub: hasDub ? (totalEps || true) : null,
            eps: totalEps,
          };

          let adultContent = false;
          const tickRateText = $(".film-poster>.tick-rate", element)
            .text()
            .trim();
          if (tickRateText.includes("18+")) {
            adultContent = true;
          }

          return {
            id,
            data_id,
            poster,
            title,
            japanese_title,
            description,
            tvInfo,
            adultContent,
          };
        }
      )
    );
    return [data, parseInt(totalPages, 10)];
  } catch (error) {
    console.error(`Error extracting data from page ${page}:`, error.message);
    throw error;
  }
}

export default extractPage;
