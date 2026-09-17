import { PREVIOUS_TOP_10 } from "@/constants";

export const INITIAL_BASELINE_TOP_10 = PREVIOUS_TOP_10;

export type RankingHistoryFile = {
  activeCycle: string;
  history: Record<string, string[]>;
};

/**
 * Retorna o Top 10 anterior configurado em src/constants/index.ts.
 */
export async function getPreviousTop10(): Promise<string[]> {
  return PREVIOUS_TOP_10;
}

/**
 * Função de compatibilidade legada.
 */
export function getFriday10hCycleKey(date: Date = new Date()): string {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `cycle-${y}-${m}-${day}`;
}

export async function readRankingHistory(): Promise<RankingHistoryFile> {
  return {
    activeCycle: "previousTop10",
    history: {
      previousTop10: PREVIOUS_TOP_10,
    },
  };
}

export async function writeRankingHistory(_data: RankingHistoryFile): Promise<void> {
  // Histórico agora é gerenciado diretamente via array PREVIOUS_TOP_10 em constants
}
