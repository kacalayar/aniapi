import { getProvider } from "../providers/index.js";

export const getSchedule = async (req) => {
  const date = req.query.date;
  const tzOffset = req.query.tzOffset || -330;
  try {
    const provider = getProvider(req.query.provider);
    const data = await provider.schedule(date, tzOffset);
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
};
