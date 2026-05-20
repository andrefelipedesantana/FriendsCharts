export type Track = {
  name: string;
  playcount: number;
  artist?: string;
  topListener?: string;
};

export type Album = {
  name: string;
  playcount: number;
  image?: string;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
};

export type User = {
  user: string;
  playcount: number;
  imageUrl?: string;
  percentage?: number;
};

export type Artist = {
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