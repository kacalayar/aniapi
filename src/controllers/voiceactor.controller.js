import { getProvider } from "../providers/index.js";

export const getVoiceActors = async (req, res) => {
  const requestedPage = parseInt(req.query.page) || 1;
  const id = req.params.id;
  try {
    const provider = getProvider(req.query.provider);
    const { totalPages, charactersVoiceActors: data } = await provider.characterList(id, requestedPage);
    return { currentPage: requestedPage, totalPages, data };
  } catch (e) {
    console.error(e);
    return e;
  }
};
