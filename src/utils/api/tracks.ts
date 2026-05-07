import { TracksResponse } from "@/types/lastfm-types";
import { getBaseUrl } from "@/constants";

export async function getTopTracks(): Promise<TracksResponse> {
  const res = await fetch(`${getBaseUrl()}/api/top-tracks`, {
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar tracks");
  }

  return res.json();
}