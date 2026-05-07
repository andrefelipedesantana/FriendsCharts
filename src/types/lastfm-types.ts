type Track = {
  name: string;
  playcount: number;
  artist?: string;
  topListener?: string;
};

type Album = {
  name: string;
  playcount: number;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
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
  totalPlays: number;
};

export type AlbumsResponse = {
  albums: Album[];
};

export type ArtistsResponse = {
  artists: Artist[];
};