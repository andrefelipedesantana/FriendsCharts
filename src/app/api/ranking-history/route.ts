import { NextRequest, NextResponse } from "next/server";
import {
  getFriday10hCycleKey,
  readRankingHistory,
  writeRankingHistory,
} from "@/lib/ranking-history";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readRankingHistory();
    const currentCycle = getFriday10hCycleKey();

    return NextResponse.json({
      currentCycle,
      activeCycle: data.activeCycle,
      currentBaseline: data.history[currentCycle] || data.history[data.activeCycle] || [],
      history: data.history,
    });
  } catch (error) {
    console.error("Erro ao buscar ranking-history:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cycle, top10 } = body;

    if (!Array.isArray(top10) || top10.length === 0) {
      return NextResponse.json(
        { error: "top10 deve ser um array não vazio com os nomes dos artistas" },
        { status: 400 }
      );
    }

    const data = await readRankingHistory();
    const targetCycle = cycle || getFriday10hCycleKey();

    data.history[targetCycle] = top10.slice(0, 10);
    data.activeCycle = targetCycle;

    await writeRankingHistory(data);

    return NextResponse.json({
      success: true,
      updatedCycle: targetCycle,
      top10: data.history[targetCycle],
    });
  } catch (error) {
    console.error("Erro ao atualizar ranking-history:", error);
    return NextResponse.json({ error: "Erro ao atualizar histórico" }, { status: 500 });
  }
}
