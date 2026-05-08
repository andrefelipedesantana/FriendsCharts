import { getTopTracks as fetchUserTracks } from "@/services/top-tracks.service";
import { users } from "@/constants";
import { unstable_cache } from "next/cache";

async function aggregateTracks() {
  const rankingTracks: Record<string, { name: string; playcount: number; artist?: string; topListener?: string; topListenerPlays?: number }> = {};
  const rankingUsers: Record<string, number> = {};

  const results = await Promise.all(
    users.map(async (user) => ({
      user,
      tracks: await fetchUserTracks(user),
    }))
  );

  for (const { user, tracks } of results) {
    for (const track of tracks) {
      const name = track.name;
      const plays = Number(track.playcount) || 0;
      const artist = track.artist?.name;
      const trackKey = `${name}:::${artist}`;

      if (!rankingTracks[trackKey]) {
        rankingTracks[trackKey] = { name, playcount: 0, artist, topListener: user, topListenerPlays: plays };
      }

      rankingTracks[trackKey].playcount += plays;
      rankingUsers[user] = (rankingUsers[user] || 0) + plays;

      if (plays > (rankingTracks[trackKey].topListenerPlays || 0)) {
        rankingTracks[trackKey].topListener = user;
        rankingTracks[trackKey].topListenerPlays = plays;
      }
    }
  }

  const sortedTracks = Object.values(rankingTracks).sort((a, b) => b.playcount - a.playcount);

  const sortedUsers = Object.entries(rankingUsers)
    .map(([user, playcount]) => ({ user, playcount }))
    .sort((a, b) => b.playcount - a.playcount);

  const totalPlays = Object.values(rankingUsers).reduce((a, b) => a + b, 0);

  return {
    tracks: sortedTracks.slice(0, 10),
    users: sortedUsers.slice(0, 3),
    totalPlays,
  };
}

export const getAggregatedTracks = unstable_cache(aggregateTracks, ["top-tracks"], {
  revalidate: 600,
  tags: ["top-tracks"],
});
