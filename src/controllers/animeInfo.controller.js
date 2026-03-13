import { getProvider } from "../providers/index.js";
import extractSeasons from "../extractors/seasons.extractor.js";

export const getAnimeInfo = async (req, res) => {
  const { id } = req.query;
  try {
    const provider = getProvider(req.query.provider);
    const [seasons, data] = await Promise.all([
      extractSeasons(id),
      provider.info(id),
    ]);
    return { data, seasons };
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "An error occurred" });
  }
};
