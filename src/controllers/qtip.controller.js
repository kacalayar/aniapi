import { getProvider } from "../providers/index.js";

export const getQtip = async (req) => {
  try {
    const { id } = req.params;
    const provider = getProvider(req.query.provider);
    const data = await provider.qtip(id);
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
};
