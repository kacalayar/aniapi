import { getProvider } from "../providers/index.js";

const FILTER_BASED_ROUTES = ["top-airing", "ongoing", "completed", "top-upcoming"];

export const getCategory = async (req, res, routeType) => {
  const requestedPage = parseInt(req.query.page) || 1;
  const provider = getProvider(req.query.provider);

  try {
    const { data, totalPages } = await provider.category(routeType, requestedPage);
    if (requestedPage > totalPages) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }
    return { totalPages, data };
  } catch (e) {
    console.error(e);
    if (e.status === 404) throw e;
    return e;
  }
};
