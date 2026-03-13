import { getProvider } from "../providers/index.js";
import { extractServers } from "../extractors/streamInfo.extractor.js";

export const getServers = async (req) => {
  try {
    const { ep } = req.query;
    const provider = getProvider(req.query.provider);
    const servers = await extractServers(ep, provider.baseUrl);
    return servers;
  } catch (e) {
    console.error(e);
    return e;
  }
};
