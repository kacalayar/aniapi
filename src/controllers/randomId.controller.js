import { getProvider } from "../providers/index.js";

export const getRandomId = async (req, res) => {
  try {
    const provider = getProvider(req.query.provider);
    const data = await provider.randomId();
    return data;
  } catch (error) {
    console.error("Error getting random anime ID:", error.message);
    return error;
  }
};
