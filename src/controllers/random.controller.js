import { getProvider } from "../providers/index.js";

export const getRandom = async (req, res) => {
  try {
    const provider = getProvider(req.query.provider);
    const data = await provider.random();
    return data;
  } catch (error) {
    console.error("Error getting random anime:", error.message);
    return error;
  }
};
