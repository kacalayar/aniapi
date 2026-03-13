import { extractor } from "../extractors/category.extractor.js";
import { extractByStatus } from "../helper/filterByStatus.helper.js";
import { getCachedData, setCachedData } from "../helper/cache.helper.js";

// Virtual routes that don't exist on the source site anymore
// They are served via /filter + qtip post-filtering by status
const FILTER_BASED_ROUTES = [
  "top-airing",
  "ongoing",
  "completed",
  "top-upcoming",
];

export const getCategory = async (req, res, routeType) => {
  if (routeType === "genre/martial-arts") {
    routeType = "genre/marial-arts";
  }
  const requestedPage = parseInt(req.query.page) || 1;
  // const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;
  try {
    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0)
    //   return cachedResponse;

    // Check if this is a filter-based virtual route
    if (FILTER_BASED_ROUTES.includes(routeType)) {
      const { data, totalPages } = await extractByStatus(routeType, requestedPage);
      const responseData = { totalPages, data };
      // setCachedData(cacheKey, responseData).catch((err) => {
      //   console.error("Failed to set cache:", err);
      // });
      return responseData;
    }

    // Standard page-based route
    const { data, totalPages } = await extractor(routeType, requestedPage);
    if (requestedPage > totalPages) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }
    const responseData = { totalPages: totalPages, data: data };
    // setCachedData(cacheKey, responseData).catch((err) => {
    //   console.error("Failed to set cache:", err);
    // });
    return responseData;
  } catch (e) {
    console.error(e);
    return e;
  }
};
