import extractFilterResults from "../extractors/filter.extractor.js";
import extractPage from "./extractPages.helper.js";
import { v1_base_url } from "../utils/base_v1.js";

/**
 * Status values for qtip post-filtering:
 *   "Currently Airing" → top-airing / ongoing
 *   "Finished Airing"  → completed
 *   "Not yet aired"    → top-upcoming
 */
const STATUS_MAP = {
  "top-airing":   "Currently Airing",
  "ongoing":      "Currently Airing",
  "completed":    "Finished Airing",
  "top-upcoming": "Not yet aired",
};

/**
 * Fetches items from /filter, enriches each via qtip,
 * then post-filters by the desired qtip status.
 *
 * For "top-upcoming", uses the /upcoming page directly since there are
 * very few items and it's a dedicated route that still works.
 *
 * @param {string} statusLabel - One of the STATUS_MAP keys
 * @param {number} page        - Desired page number (virtual)
 * @param {number} perPage     - Items per virtual page (default 24)
 * @param {string} baseUrl     - Base URL domain to use
 * @returns {Promise<{data: Array, totalPages: number}>}
 */
export async function extractByStatus(statusLabel, page = 1, perPage = 24, baseUrl = v1_base_url) {
  const wantedStatus = STATUS_MAP[statusLabel];
  if (!wantedStatus) {
    throw new Error(`Unknown status label: ${statusLabel}`);
  }

  // For "top-upcoming" / "Not yet aired", use /upcoming directly since it works
  // and there are very few items (server-side filter doesn't work for this)
  if (statusLabel === "top-upcoming") {
    try {
      const [data, totalPages] = await extractPage(page, "upcoming", baseUrl);
      return { data, totalPages };
    } catch {
      return { data: [], totalPages: 1 };
    }
  }

  // For other statuses, fetch from /filter and post-filter via qtip status
  // Use "default" sort which gives a good mix of statuses
  const needed = page * perPage;
  const allFiltered = [];
  let upstreamPage = 1;
  const maxUpstreamPages = Math.max(page * 4, 8); // scan enough pages

  while (allFiltered.length < needed && upstreamPage <= maxUpstreamPages) {
    const [totalPage, items] = await extractFilterResults({
      sort: "default",
      page: upstreamPage,
    }, baseUrl);

    if (!items || items.length === 0) break;

    // Post-filter: only keep items whose qtip status matches
    const matching = items.filter(
      (item) => item.status && item.status === wantedStatus
    );
    allFiltered.push(...matching);

    // If upstream has no more pages, stop
    if (upstreamPage >= totalPage) break;
    upstreamPage++;
  }

  // Slice for the requested virtual page
  const start = (page - 1) * perPage;
  const pageData = allFiltered.slice(start, start + perPage);

  // Estimate total virtual pages
  const totalVirtualPages = Math.max(1, Math.ceil(allFiltered.length / perPage));

  return { data: pageData, totalPages: totalVirtualPages };
}
