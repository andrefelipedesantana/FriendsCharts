import { unstable_cache } from "next/cache";

import { getWeeklyArtistChart } from "@/services/weekly-artist-chart.service";
import { EXCLUDED_ARTISTS, users } from "@/constants";

const WEEK_IN_SECONDS = 604_800;

/** Guarda o suficiente para comparar Top 10 e detectar saídas. */
const HISTORY_DEPTH = 50;

export type PreviousArtistsResult = {
  artists: Array<{ name: string; playcount: number }>;
  /** Falso quando nenhum usuário devolveu dados — não há como comparar. */
  available: boolean;
};

/**
 * Ranking agregado da semana **anterior** (janela de -14d a -7d), usando a
 * mesma soma de plays entre todos os usuários do grupo. É calculado à parte do
 * ranking atual justamente para não alterar a ordenação vigente.
 */
async function aggregatePreviousArtists(): Promise<PreviousArtistsResult> {
  const now = Math.floor(Date.now() / 1000);
  const to = now - WEEK_IN_SECONDS;
  const from = to - WEEK_IN_SECONDS;

  const results = await Promise.all(
    users.map(async (user) => getWeeklyArtistChart(user, from, to))
  );

  const reachedUsers = results.filter((artists) => artists.length > 0).length;
  if (reachedUsers === 0) {
    return { artists: [], available: false };
  }

  const ranking: Record<string, number> = {};

  for (const artists of results) {
    for (const artist of artists) {
      const name = artist?.name;
      if (!name) continue;
      ranking[name] = (ranking[name] || 0) + (Number(artist.playcount) || 0);
    }
  }

  const sorted = Object.entries(ranking)
    .filter(([name]) => !EXCLUDED_ARTISTS.includes(name))
    .map(([name, playcount]) => ({ name, playcount }))
    .sort((a, b) => b.playcount - a.playcount)
    .slice(0, HISTORY_DEPTH);

  return { artists: sorted, available: sorted.length > 0 };
}

export const getPreviousWeekArtists = unstable_cache(
  aggregatePreviousArtists,
  ["previous-week-artists"],
  { revalidate: 600, tags: ["previous-week-artists"] }
);
