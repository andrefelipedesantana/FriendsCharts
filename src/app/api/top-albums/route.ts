import { users } from "@/constants";
import { getTopAlbums } from "@/services/top-album.service";

export async function GET() {
  try {
    const ranking: Record<string, number> = {};

    const results = await Promise.all(
      users.map(user => getTopAlbums(user))
    )

    for (const albums of results) {
      for (const album of albums) {
        const name = album.name;
        const plays = parseInt(album.playcount);

        ranking[name] = (ranking[name] || 0) + plays;
      }
    }

    const sorted = Object.entries(ranking)
      .map(([name, playcount]) => ({ name, playcount }))
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