import { getPreviousTop10, INITIAL_BASELINE_TOP_10 } from "@/lib/ranking-history";

export type PreviousArtistsResult = {
  artists: Array<{ name: string; playcount: number }>;
  /** Falso quando nenhum dado pôde ser recuperado — não há como comparar. */
  available: boolean;
};

/**
 * Retorna o ranking da semana anterior para cálculo de movimentação (subiu, desceu, novo).
 * O histórico é gerenciado por ciclos semanais com virada toda Sexta-feira às 10h (Horário de Brasília).
 */
export async function getPreviousWeekArtists(currentTop10?: string[]): Promise<PreviousArtistsResult> {
  try {
    const top10 = await getPreviousTop10(currentTop10);
    return {
      artists: top10.map((name, index) => ({
        name,
        playcount: 10 - index,
      })),
      available: top10.length > 0,
    };
  } catch (error) {
    console.error("Erro ao carregar ranking da semana anterior:", error);
    return {
      artists: INITIAL_BASELINE_TOP_10.map((name, index) => ({
        name,
        playcount: 10 - index,
      })),
      available: true,
    };
  }
}

