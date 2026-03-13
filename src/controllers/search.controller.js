import { getProvider } from "../providers/index.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const search = async (req) => {
  try {
    let { keyword, type, status, rated, score, season, language, genres, sort, sy, sm, sd, ey, em, ed } = req.query;
    let page = parseInt(req.query.page) || 1;

    keyword = await convertForeignLanguage(keyword);

    const provider = getProvider(req.query.provider);
    const [totalPage, data] = await provider.search({
      keyword, type, status, rated, score, season, language, genres, sort, page, sy, sm, sd, ey, em, ed,
    });
    if (page > totalPage) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }
    return { data, totalPage };
  } catch (e) {
    console.error(e);
    if (e.status === 404) throw e;
    throw new Error("An error occurred while processing your request.");
  }
};
