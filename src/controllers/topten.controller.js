import { getProvider } from "../providers/index.js";

export const getTopTen = async (req, res) => {
  try {
    const provider = getProvider(req.query.provider);
    const topTen = await provider.topTen();
    return topTen;
  } catch (e) {
    console.error(e);
    return e;
  }
};
