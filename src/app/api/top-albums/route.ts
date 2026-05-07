import { users } from "@/constants";
import { getTopAlbums } from "@/services/top-album.service";

export const dynamic = 'force-dynamic';

type AlbumRanking = {
  playcount: number;
  image?: string;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
};

export async function GET() {
  try {

    const ranking: Record<string, AlbumRanking> = {};

    const results = await Promise.all(
      users.map(async (user) => ({
        user,
        albums: await getTopAlbums(user),
      }))
    );

    for (const result of results) {
      const { user, albums } = result;

      for (const album of albums) {
        const name = album.name;
        const plays = Number(album.playcount) || 0;
        const artist = album.artist?.name;

        const image =
          album.image?.find(
            (img: any) => img.size === "extralarge" || img.size === "large"
          )?.["#text"];

        if (!ranking[name]) {
          ranking[name] = {
            playcount: 0,
            image,
            artist,
            topListener: user,
            topListenerPlays: plays,
          };
        }

        ranking[name].playcount += plays;

        if (plays > (ranking[name].topListenerPlays || 0)) {
          ranking[name].topListener = user;
          ranking[name].topListenerPlays = plays;
        }
      }
    }

    const sorted = Object.entries(ranking)
      .map(([name, data]) => ({
        name,
        playcount: data.playcount,
        image: data.image,
        artist: data.artist,
        topListener: data.topListener,
      }))
      .sort((a, b) => b.playcount - a.playcount);

    return Response.json({
      albums: sorted.slice(0, 10),
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}