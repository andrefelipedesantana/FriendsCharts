import { AlbumsResponse } from "@/types/lastfm-types";
import { getBaseUrl } from "@/constants";

export async function getTopAlbums(): Promise<AlbumsResponse> {
  const res = await fetch(`${getBaseUrl()}/api/top-albums`, {
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar albums");
  }

  return res.json();
}