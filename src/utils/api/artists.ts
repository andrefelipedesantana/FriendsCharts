import { ArtistsResponse } from "@/types/lastfm-types";

export async function getTopArtists(): Promise<ArtistsResponse> {
  const res = await fetch("http://localhost:3000/api/top-artists", {
    next: { revalidate: 21600 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar artistas");
  }

  return res.json();
}