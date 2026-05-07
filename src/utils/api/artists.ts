import { ArtistsResponse } from "@/types/lastfm-types";
import { getBaseUrl } from "@/constants";

export async function getTopArtists(): Promise<ArtistsResponse> {
  const res = await fetch(`${getBaseUrl()}/api/top-artists`, {
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar artistas");
  }

  return res.json();
}