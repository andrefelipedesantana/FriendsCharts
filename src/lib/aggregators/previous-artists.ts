import { findPreviousEdition } from "@/lib/ranking-history";

export type PreviousArtistsResult = {
  artists: Array<{ name: string; playcount: number }>;
  /** Falso quando nenhum dado pôde ser recuperado — não há como comparar. */
  available: boolean;
  /** Edição usada como base ("2026-W45"). */
  editionKey?: string;
};

/**
 * Top 10 da última edição publicada antes de `currentEditionKey`, base para
 * calcular quem subiu, desceu, é novo ou saiu do ranking.
 */
export async function getPreviousWeekArtists(
  currentEditionKey: string
): Promise<PreviousArtistsResult> {
  const previous = findPreviousEdition(currentEditionKey);
  const top10 = previous?.top10 ?? [];

  return {
    artists: top10.map((name, index) => ({ name, playcount: 10 - index })),
    available: top10.length > 0,
    editionKey: previous?.key,
  };
}
