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
  topListener?: string;
  topListenerPlays?: number;
};

export type TracksResponse = {
  tracks: Track[];
  users: User[];
};

export type AlbumsResponse = {
  albums: Album[];
};

export type ArtistsResponse = {
  artists: Artist[];
};