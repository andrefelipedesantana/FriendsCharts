import axios from "axios";
import { API_KEY } from "@/constants";

/**
 * Chart de artistas de uma janela arbitrária de tempo. Diferente de
 * `user.gettopartists` (que só aceita períodos fixos como `7day`), este
 * endpoint recebe `from`/`to` em UNIX timestamp — é o que permite comparar
 * a semana atual com a anterior sem guardar histórico próprio.
 */
export async function getWeeklyArtistChart(user: string, from: number, to: number) {
  try {
    const res = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getweeklyartistchart",
        user,
        api_key: API_KEY,
        from,
        to,
        format: "json",
      },
    });

    const artists = res.data?.weeklyartistchart?.artist;
    if (!artists) return [];

    // A API devolve objeto único quando há apenas um artista no período.
    return Array.isArray(artists) ? artists : [artists];
  } catch (error) {
    console.error(`Erro ao buscar o chart semanal de ${user}:`, error);
    return [];
  }
}
