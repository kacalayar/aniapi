import axios from "axios";
import { v1_base_url } from "../utils/base_v1.js";

export async function extractSubtitle(id, baseUrl = v1_base_url) {
  const resp = await axios.get(
    `https://${baseUrl}/ajax/episode/sources/?id=${id}`
  );

  const ajaxLink = resp.data?.link;
  if (!ajaxLink) throw new Error("Missing link in sources response");

  // Extract sourceId and base URL from the embed link
  const sourceIdMatch = /\/([^/?]+)\?/.exec(ajaxLink);
  const sourceId = sourceIdMatch?.[1];
  if (!sourceId) throw new Error("Unable to extract sourceId from link");

  const baseUrlMatch = ajaxLink.match(
    /^(https?:\/\/[^\/]+(?:\/[^\/]+){3})/
  );
  if (!baseUrlMatch) throw new Error("Could not extract base URL");
  const baseUrl = baseUrlMatch[1];

  const source = await axios.get(
    `${baseUrl}/getSources?id=${sourceId}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: ajaxLink,
      },
    }
  );
  const subtitles = source.data.tracks;
  const intro = source.data.intro;
  const outro = source.data.outro;
  return { subtitles, intro, outro };
}
