import { getTopTracks } from "@/services/top-tracks.service";
import { users } from "@/constants";

export async function GET() {
  try {
    const rankingTracks: Record<string, number> = {};
    const rankingUsers: Record<string, number> = {};

    const results = await Promise.all(
      users.map(async (user) => ({
        user,
        tracks: await getTopTracks(user),
      }))
    );

    for (const result of results) {
      const { user, tracks } = result;

      for (const track of tracks) {
        const name = track.name ;
        const plays = Number(track.playcount) || 0;

        rankingTracks[name] = (rankingTracks[name] || 0) + plays;
        rankingUsers[user] = (rankingUsers[user] || 0) + plays;
      }
    }

    const sortedTracks = Object.entries(rankingTracks)
      .map(([name, playcount]) => ({ name, playcount }))
      .sort((a, b) => b.playcount - a.playcount);

    const sortedUsers = Object.entries(rankingUsers)
      .map(([user, playcount]) => ({ user, playcount }))
      .sort((a, b) => b.playcount - a.playcount);

    return Response.json({
      tracks: sortedTracks.slice(0, 10),
      users: sortedUsers,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}