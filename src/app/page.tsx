import { getTopAlbums } from "@/utils/api/albums";
import { getTopArtists } from "@/utils/api/artists";
import { getTopTracks } from "@/utils/api/tracks";

export default async function Home() {
  const [tracksData, albumsData, artistsData] = await Promise.all([
    getTopTracks(),
    getTopAlbums(),
    getTopArtists(),
  ]);

  return (
    <div>

      <div>
        <h1>Top Tracks</h1>
        {tracksData?.tracks?.map((track) => (
          <p key={track.name}>
            {track.name} {track.playcount}
          </p>
        ))}
      </div>

      <div>
        <h1>Top Albums</h1>
        {albumsData?.albums?.map((album) => (
          <p key={album.name}>
            {album.name} - {album.playcount}
          </p>
        ))}
      </div>

      <div>
        <h1>Top Users</h1>
        {tracksData?.users?.map((user) => (
          <p key={user.user}>
            {user.user} - {user.playcount}
          </p>
        ))}
      </div>

      <div>
        <h1>Top Artists</h1>
        {artistsData?.artists?.map((artist) => (
          <p key={artist.name}>
            {artist.name} - {artist.playcount}
          </p> 
        ))}
      </div>

    </div>
  );
}