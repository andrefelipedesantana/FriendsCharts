import axios from "axios";
import { API_KEY } from "@/constants";

export type WeeklyChartKind = "artist" | "track" | "album";

export type WeeklyChartItem = {
  name: string;
  artist?: string;
  playcount: number;
};

/**
 * `ok: false` significa "não sei" — nunca "a pessoa não ouviu nada". Quem
 * consome não pode transformar uma falha em lista vazia, senão tudo vira
 * "NOVO" na comparação (foi exatamente o defeito do chart geral).
 */
export type WeeklyChartResult =
  | { ok: true; items: WeeklyChartItem[] }
  | { ok: false; reason: string };

type RawItem = {
  name?: string;
  playcount?: string | number;
  artist?: { "#text"?: string; name?: string };
};

/**
 * Chart de uma janela exata de tempo (`from`/`to` em UNIX timestamp) via
 * `user.getweekly{artist,track,album}chart`.
 *
 * A semana atual e a anterior saem deste mesmo endpoint, com janelas de
 * mesmo tamanho e encostadas uma na outra, então a comparação nunca mistura
 * fontes. A resposta é aceita só se o Last.fm devolver exatamente a janela
 * pedida (`@attr.from/to`).
 */
export async function getWeeklyChart(
  kind: WeeklyChartKind,
  user: string,
  from: number,
  to: number
): Promise<WeeklyChartResult> {
  try {
    const res = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: `user.getweekly${kind}chart`,
        user,
        api_key: API_KEY,
        from,
        to,
        format: "json",
      },
      timeout: 15_000,
    });

    const root = res.data?.[`weekly${kind}chart`];
    if (!root) {
      return { ok: false, reason: `resposta sem weekly${kind}chart` };
    }

    const attr = root["@attr"] ?? {};
    if (String(attr.from) !== String(from) || String(attr.to) !== String(to)) {
      return {
        ok: false,
        reason: `janela devolvida (${attr.from}–${attr.to}) difere da pedida (${from}–${to})`,
      };
    }

    const raw: RawItem[] = !root[kind] ? [] : Array.isArray(root[kind]) ? root[kind] : [root[kind]];

    return {
      ok: true,
      items: raw
        .filter((item) => item?.name)
        .map((item) => ({
          name: item.name as string,
          artist: item.artist?.["#text"] ?? item.artist?.name,
          playcount: Number(item.playcount) || 0,
        })),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Erro no chart semanal (${kind}) de ${user}:`, reason);
    return { ok: false, reason };
  }
}
