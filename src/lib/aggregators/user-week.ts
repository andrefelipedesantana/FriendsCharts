import { unstable_cache } from "next/cache";

import { EXCLUDED_ARTISTS } from "@/constants";
import { getWeeklyChart, type WeeklyChartItem } from "@/services/weekly-chart.service";

const NOISE_ARTIST = "Música Para Estudar";
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
/** Alinha o fim da janela em blocos de 10 min: o cache reaproveita e as duas semanas encostam. */
const WINDOW_STEP_SECONDS = 600;
/** Last.fm limita por IP; ~13 usuários × várias chamadas não podem sair todas de uma vez. */
const MAX_CONCURRENT_REQUESTS = 4;

export type WeekWindow = { from: number; to: number };

export type UserWeek = {
  user: string;
  window: WeekWindow;
  artists: WeeklyChartItem[];
  tracks: WeeklyChartItem[];
  albums: WeeklyChartItem[];
  /** Mesma regra do ranking de ouvintes do grupo: soma das músicas, sem ruído branco. */
  plays: number;
};

/** Semana atual e a anterior, do mesmo tamanho e encostadas uma na outra. */
export function weekWindows(reference = new Date()) {
  const to =
    Math.floor(reference.getTime() / 1000 / WINDOW_STEP_SECONDS) * WINDOW_STEP_SECONDS;

  return {
    current: { from: to - WEEK_IN_SECONDS, to },
    previous: { from: to - 2 * WEEK_IN_SECONDS, to: to - WEEK_IN_SECONDS },
  };
}

// --- limite de concorrência --------------------------------------------------
let active = 0;
const queue: Array<() => void> = [];

async function limited<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active += 1;
  try {
    return await task();
  } finally {
    active -= 1;
    queue.shift()?.();
  }
}

/** Ordem estável: empate em plays é decidido pelo nome, nunca pela ordem da API. */
function byPlays(a: WeeklyChartItem, b: WeeklyChartItem) {
  return b.playcount - a.playcount || a.name.localeCompare(b.name, "pt-BR");
}

async function fetchUserWeek(user: string, from: number, to: number): Promise<UserWeek> {
  const [artists, tracks, albums] = await Promise.all([
    limited(() => getWeeklyChart("artist", user, from, to)),
    limited(() => getWeeklyChart("track", user, from, to)),
    limited(() => getWeeklyChart("album", user, from, to)),
  ]);

  // Falha lança: `unstable_cache` não guarda exceções, então uma falha
  // passageira não fica presa no cache como se fosse uma semana vazia.
  for (const result of [artists, tracks, albums]) {
    if (!result.ok) throw new Error(`Semana de ${user} indisponível: ${result.reason}`);
  }

  const okArtists = artists.ok ? artists.items : [];
  const okTracks = tracks.ok ? tracks.items : [];
  const okAlbums = albums.ok ? albums.items : [];

  const cleanTracks = okTracks
    .filter((track) => track.playcount > 0 && track.artist !== NOISE_ARTIST)
    .sort(byPlays);

  return {
    user,
    window: { from, to },
    artists: okArtists
      .filter((artist) => artist.playcount > 0 && !EXCLUDED_ARTISTS.includes(artist.name))
      .sort(byPlays),
    tracks: cleanTracks,
    albums: okAlbums
      .filter((album) => album.playcount > 0 && !album.name.startsWith("Barulho"))
      .sort(byPlays),
    plays: cleanTracks.reduce((sum, track) => sum + track.playcount, 0),
  };
}

const cachedUserWeek = unstable_cache(fetchUserWeek, ["user-week"], {
  revalidate: 600,
  tags: ["user-week"],
});

/** `null` quando o Last.fm não respondeu a janela exata — "não sei", não "vazio". */
export async function getUserWeek(user: string, window: WeekWindow): Promise<UserWeek | null> {
  try {
    return await cachedUserWeek(user, window.from, window.to);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return null;
  }
}
