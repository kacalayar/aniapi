import { getProvider } from "../providers/index.js";

const getTopSearch = async (req) => {
  try {
    const provider = getProvider(req.query?.provider);
    const data = await provider.topSearch();
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export default getTopSearch;
