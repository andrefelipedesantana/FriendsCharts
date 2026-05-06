import axios from "axios";
import { API_KEY } from "@/constants";

export async function getTopTracks(user: string) {
  const res = await axios.get("https://ws.audioscrobbler.com/2.0/", {
    params: {
      method: "user.gettoptracks",
      user,
      api_key: API_KEY,
      period: "7day",
      limit: 800,
      format: "json",
    },
  });

  return res.data.toptracks.track;
}