import { getProvider } from "../providers/index.js";

const getVoiceActor = async (req, res) => {
  const id = req.params.id;
  try {
    const provider = getProvider(req.query.provider);
    const voiceActorData = await provider.actor(id);

    if (!voiceActorData || voiceActorData.results.data.length === 0) {
      return res.status(404).json({ error: "No voice actor found." });
    }

    return res.json(voiceActorData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "An error occurred" });
  }
};

export default getVoiceActor;
