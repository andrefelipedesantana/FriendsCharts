import { getTopArtists as fetchUserArtists } from "@/services/top-artists.service";
import { users } from "@/constants";
import { unstable_cache } from "next/cache";

async function aggregateArtists() {
  const rankingArtists: Record<string, { playcount: number; topListener?: string; topListenerPlays?: number }> = {};

  const results = await Promise.all(
    users.map(async (user) => ({
      user,
      artists: await fetchUserArtists(user),
    }))
  );

  for (const { user, artists } of results) {
    for (const artist of artists) {
      const name = artist.name;
      const plays = Number(artist.playcount) || 0;

      if (!rankingArtists[name]) {
        rankingArtists[name] = { playcount: 0, topListener: user, topListenerPlays: plays };
      }

      rankingArtists[name].playcount += plays;

      if (plays > (rankingArtists[name].topListenerPlays || 0)) {
        rankingArtists[name].topListener = user;
        rankingArtists[name].topListenerPlays = plays;
      }
    }
  }

  const sorted = Object.entries(rankingArtists)
    .map(([name, data]) => ({
      name,
      playcount: data.playcount,
      topListener: data.topListener,
    }))
    .sort((a, b) => b.playcount - a.playcount);

  return { artists: sorted.slice(0, 10) };
}

export const getAggregatedArtists = unstable_cache(aggregateArtists, ["top-artists"], {
  revalidate: 600,
  tags: ["top-artists"],
});
