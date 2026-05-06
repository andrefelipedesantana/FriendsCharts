type Track = {
  name: string;
  playcount: number;
};

type Album = {
  name: string;
  playcount: number;
};

type User = {
  user: string;
  playcount: number;
};

type Artist = {
  name: string;
  playcount: number;
}

type TracksResponse = {
  tracks: Track[];
  users: User[];
};

type AlbumsResponse = {
  albums: Album[];
};

type ArtistsResponse = {
  artists: Artist[];
}

async function getTopTracks(): Promise<TracksResponse> {
  const res = await fetch('http://localhost:3000/api/top-tracks');

  if (!res.ok) {
    throw new Error('Erro ao buscar tracks');
  }

  return res.json();
}

async function getTopAlbums(): Promise<AlbumsResponse> {
  const res = await fetch('http://localhost:3000/api/top-albums');

  if (!res.ok) {
    throw new Error('Erro ao buscar albums');
  }

  return res.json();
}

async function getTopArtists(): Promise<ArtistsResponse>{
  const res = await fetch('http://localhost:3000/api/top-artists');

  if(!res.ok){
    throw new Error('Erro ao buscar artistas');
  }

  return res.json();
}

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