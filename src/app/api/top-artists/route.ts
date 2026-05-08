import { getAggregatedArtists } from "@/lib/aggregators/artists";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAggregatedArtists();
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}