import { getProvider } from "../providers/index.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const getSuggestions = async (req) => {
  let { keyword } = req.query;
  keyword = await convertForeignLanguage(keyword);
  try {
    const provider = getProvider(req.query.provider);
    const data = await provider.suggestion(encodeURIComponent(keyword));
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
};
