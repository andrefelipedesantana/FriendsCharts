import { getTopAlbums as fetchUserAlbums } from "@/services/top-album.service";
import { users } from "@/constants";
import { unstable_cache } from "next/cache";

type AlbumData = {
  playcount: number;
  image?: string;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
};

async function aggregateAlbums() {
  const ranking: Record<string, AlbumData> = {};

  const results = await Promise.all(
    users.map(async (user) => ({
      user,
      albums: await fetchUserAlbums(user),
    }))
  );

  for (const { user, albums } of results) {
    for (const album of albums) {
      const name = album.name;
      const plays = Number(album.playcount) || 0;
      const artist = album.artist?.name;
      const image = album.image?.find(
        (img: any) => img.size === "extralarge" || img.size === "large"
      )?.["#text"];

      if (!ranking[name]) {
        ranking[name] = { playcount: 0, image, artist, topListener: user, topListenerPlays: plays };
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

  return { albums: sorted.slice(0, 10) };
}

export const getAggregatedAlbums = unstable_cache(aggregateAlbums, ["top-albums"], {
  revalidate: 600,
  tags: ["top-albums"],
});
