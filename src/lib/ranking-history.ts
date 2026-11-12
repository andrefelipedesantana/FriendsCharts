import history from "@/data/ranking-history.json";

/**
 * Histórico dos Top 10 publicados, chaveado pela edição ("2026-W45").
 *
 * Cada edição guarda exatamente o ranking que saiu na imagem exportada na
 * quinta-feira. A comparação usa sempre a edição *anterior* à atual, então
 * exportar de novo na mesma semana (ou o redeploy disparado pelo commit do
 * snapshot) nunca faz a edição ser comparada consigo mesma.
 */
export type RankingHistoryFile = {
  editions: Record<string, string[]>;
};

export const RANKING_HISTORY_PATH = "src/data/ranking-history.json";

export const rankingHistory = history as RankingHistoryFile;

export type PreviousEdition = {
  key: string;
  top10: string[];
};

/** Última edição salva estritamente anterior a `currentKey`. */
export function findPreviousEdition(
  currentKey: string,
  data: RankingHistoryFile = rankingHistory
): PreviousEdition | null {
  const key = Object.keys(data.editions)
    .filter((candidate) => candidate < currentKey && data.editions[candidate]?.length)
    .sort()
    .pop();

  return key ? { key, top10: data.editions[key] } : null;
}

/** Grava (ou substitui) o snapshot de uma edição, preservando as demais. */
export function withEdition(
  data: RankingHistoryFile,
  editionKey: string,
  top10: string[]
): RankingHistoryFile {
  const editions = { ...data.editions, [editionKey]: top10.slice(0, 10) };
  const sorted = Object.fromEntries(
    Object.keys(editions)
      .sort()
      .map((key) => [key, editions[key]])
  );

  return { editions: sorted };
}

export function serializeHistory(data: RankingHistoryFile) {
  return `${JSON.stringify(data, null, 2)}\n`;
}
