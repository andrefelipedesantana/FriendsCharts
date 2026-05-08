import { getAggregatedAlbums } from "@/lib/aggregators/albums";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAggregatedAlbums();
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}