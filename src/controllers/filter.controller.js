import { getProvider } from "../providers/index.js";

export const filter = async (req) => {
  try {
    const {
      type, status, rated, score, season, language, genres, sort,
      sy, sm, sd, ey, em, ed, keyword, page = 1
    } = req.query;

    const pageNum = parseInt(page);

    const params = {};
    if (type) params.type = type;
    if (status) params.status = status;
    if (rated) params.rated = rated;
    if (score) params.score = score;
    if (season) params.season = season;
    if (language) params.language = language;
    if (genres) params.genres = genres;
    if (sort) params.sort = sort;
    if (sy) params.sy = sy;
    if (sm) params.sm = sm;
    if (sd) params.sd = sd;
    if (ey) params.ey = ey;
    if (em) params.em = em;
    if (ed) params.ed = ed;
    if (keyword) params.keyword = keyword;
    if (pageNum > 1) params.page = pageNum;

    const provider = getProvider(req.query.provider);
    const [totalPage, data, currentPage, hasNextPage] = await provider.filter(params);

    if (pageNum > totalPage) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }

    return { data, totalPage, currentPage, hasNextPage };
  } catch (e) {
    console.error(e);
    if (e.status === 404) throw e;
    throw new Error("An error occurred while processing your request.");
  }
};
