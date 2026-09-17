import { PREVIOUS_TOP_10 } from "@/constants";

export type PreviousArtistsResult = {
  artists: Array<{ name: string; playcount: number }>;
  /** Falso quando nenhum dado pôde ser recuperado — não há como comparar. */
  available: boolean;
};

/**
 * Retorna o ranking da semana anterior para cálculo de movimentação (subiu, desceu, novo).
 * Consome diretamente o array PREVIOUS_TOP_10 configurado em src/constants/index.ts.
 */
export async function getPreviousWeekArtists(): Promise<PreviousArtistsResult> {
  const top10 = PREVIOUS_TOP_10 ?? [];

  return {
    artists: top10.map((name, index) => ({
      name,
      playcount: 10 - index,
    })),
    available: top10.length > 0,
  };
}
