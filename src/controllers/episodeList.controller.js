import { getProvider } from "../providers/index.js";

export const getEpisodes = async (req, res) => {
  const { id } = req.params;
  try {
    const provider = getProvider(req.query.provider);
    const data = await provider.episodes(encodeURIComponent(id));
    return data;
  } catch (e) {
    console.error("Error fetching episodes:", e);
    return e;
  }
};
