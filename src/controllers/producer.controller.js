import { getProvider } from "../providers/index.js";

export const getProducer = async (req) => {
  const { id } = req.params;
  const requestedPage = parseInt(req.query.page) || 1;
  try {
    const provider = getProvider(req.query.provider);
    const { data, totalPages } = await provider.producer(id, requestedPage);
    if (requestedPage > totalPages) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }
    return { data, totalPages };
  } catch (e) {
    console.error(e);
    if (e.status === 404) throw e;
    throw new Error("An error occurred while processing your request.");
  }
};
