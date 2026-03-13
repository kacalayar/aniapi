import { getProvider } from "../providers/index.js";

export const getNextEpisodeSchedule = async (req) => {
  const { id } = req.params;
  try {
    const provider = getProvider(req.query.provider);
    const nextEpisodeSchedule = await provider.nextEpisodeSchedule(id);
    return { nextEpisodeSchedule };
  } catch (e) {
    console.error(e);
    return e;
  }
};
