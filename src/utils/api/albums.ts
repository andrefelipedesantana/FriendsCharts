import { AlbumsResponse } from "@/types/lastfm-types";

export async function getTopAlbums(): Promise<AlbumsResponse> {
  const res = await fetch("http://localhost:3000/api/top-albums", {
    next: { revalidate: 21600 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar albums");
  }

  return res.json();
}