import { TracksResponse } from "@/types/lastfm-types";

export async function getTopTracks(): Promise<TracksResponse> {
  const res = await fetch("http://localhost:3000/api/top-tracks", {
    next: { revalidate: 21600 }
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar tracks");
  }

  return res.json();
}