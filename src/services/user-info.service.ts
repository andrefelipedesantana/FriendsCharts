import axios from "axios";
import { API_KEY } from "@/constants";

export async function getUserInfo(user: string) {
  try {
    const res = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getinfo",
        user,
        api_key: API_KEY,
        format: "json",
      },
    });

    return res.data.user;
  } catch (error) {
    console.error("Erro ao buscar user info:", error);
    return null;
  }
}
