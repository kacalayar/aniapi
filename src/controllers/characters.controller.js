import { getProvider } from "../providers/index.js";

const getCharacter = async (req, res) => {
  const id = req.params.id;
  try {
    const provider = getProvider(req.query.provider);
    const characterData = await provider.character(id);

    if (!characterData || characterData.results.data.length === 0) {
      return res.status(404).json({ error: "Character not found." });
    }

    return res.json(characterData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "An error occurred" });
  }
};

export default getCharacter;
