import { getProvider } from "../providers/index.js";
import { routeTypes } from "../routes/category.route.js";

const genres = routeTypes
  .slice(0, 41)
  .map((genre) => genre.replace("genre/", ""));

export const getHomeInfo = async (req, res) => {
  try {
    const provider = getProvider(req.query.provider);
    const [
      spotlights,
      trending,
      topTen,
      schedule,
      topAiringResult,
      mostPopular,
      mostFavorite,
      completedResult,
      latestEpisode,
      topUpcomingResult,
      recentlyAdded,
    ] = await Promise.all([
      provider.spotlight(),
      provider.trending(),
      provider.topTen(),
      provider.schedule(new Date().toISOString().split("T")[0]),
      provider.category("top-airing", 1),
      provider.category("most-popular", 1),
      provider.category("most-favorite", 1),
      provider.category("completed", 1),
      provider.category("recently-updated", 1),
      provider.category("top-upcoming", 1),
      provider.category("recently-added", 1),
    ]);
    const responseData = {
      spotlights,
      trending,
      topTen,
      today: { schedule },
      topAiring: topAiringResult.data,
      mostPopular: mostPopular.data,
      mostFavorite: mostFavorite.data,
      latestCompleted: completedResult.data,
      latestEpisode: latestEpisode.data,
      topUpcoming: topUpcomingResult.data,
      recentlyAdded: recentlyAdded.data,
      genres,
    };
    return responseData;
  } catch (fetchError) {
    console.error("Error fetching fresh data:", fetchError);
    return fetchError;
  }
};
