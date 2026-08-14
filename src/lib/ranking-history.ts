import fs from "fs/promises";
import path from "path";

export const INITIAL_BASELINE_TOP_10 = [
  "Ariana Grande",
  "Maria Bethânia",
  "Charli xcx",
  "Tyla",
  "Anitta",
  "Madonna",
  "Lady Gaga",
  "Taylor Swift",
  "Slayyyter",
  "Djavan",
];

export type RankingHistoryFile = {
  activeCycle: string;
  history: Record<string, string[]>;
};

const HISTORY_FILE_PATH = path.join(process.cwd(), "src", "data", "ranking-history.json");

/**
 * Extrai partes de data no fuso horário America/Sao_Paulo (UTC-3).
 */
export function getSaoPauloDate(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const dayOfWeek = localDate.getUTCDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab

  return { year, month, day, hour, minute, second, dayOfWeek, localDate };
}

/**
 * Calcula o identificador do ciclo semanal baseado no corte de Sexta-feira às 10:00.
 * A janela vai de Sexta 10:00 até a Sexta seguinte às 09:59:59.
 */
export function getFriday10hCycleKey(date: Date = new Date()): string {
  const { year, month, day, hour, dayOfWeek } = getSaoPauloDate(date);
  let daysToSubtract = 0;

  if (dayOfWeek === 5) {
    daysToSubtract = hour >= 10 ? 0 : 7;
  } else {
    daysToSubtract = (dayOfWeek - 5 + 7) % 7;
  }

  const cutoffDate = new Date(Date.UTC(year, month - 1, day - daysToSubtract));
  const y = cutoffDate.getUTCFullYear();
  const m = String(cutoffDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(cutoffDate.getUTCDate()).padStart(2, "0");

  return `cycle-${y}-${m}-${d}`;
}

/**
 * Retorna o identificador do próximo ciclo semanal (+7 dias).
 */
export function getNextFriday10hCycleKey(date: Date = new Date()): string {
  const currentCycle = getFriday10hCycleKey(date);
  const datePart = currentCycle.replace("cycle-", "");
  const [y, m, d] = datePart.split("-").map(Number);
  const nextDate = new Date(Date.UTC(y, m - 1, d + 7));
  const ny = nextDate.getUTCFullYear();
  const nm = String(nextDate.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(nextDate.getUTCDate()).padStart(2, "0");

  return `cycle-${ny}-${nm}-${nd}`;
}

/**
 * Lê o arquivo de histórico com tolerância a falhas.
 */
export async function readRankingHistory(): Promise<RankingHistoryFile> {
  try {
    const raw = await fs.readFile(HISTORY_FILE_PATH, "utf-8");
    return JSON.parse(raw) as RankingHistoryFile;
  } catch {
    const currentCycle = getFriday10hCycleKey();
    return {
      activeCycle: currentCycle,
      history: {
        [currentCycle]: INITIAL_BASELINE_TOP_10,
        "cycle-2026-08-07": INITIAL_BASELINE_TOP_10,
      },
    };
  }
}

/**
 * Salva o arquivo de histórico no disco.
 */
export async function writeRankingHistory(data: RankingHistoryFile): Promise<void> {
  try {
    const dir = path.dirname(HISTORY_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Falha ao salvar ranking-history.json:", error);
  }
}

/**
 * Obtém o Top 10 da semana anterior para comparação e registra automaticamente o baseline
 * do próximo ciclo para que funcione mesmo se ninguém acessar na sexta-feira.
 */
export async function getPreviousTop10(currentLiveTop10?: string[]): Promise<string[]> {
  const currentCycle = getFriday10hCycleKey();
  const nextCycle = getNextFriday10hCycleKey();
  const data = await readRankingHistory();

  let baseline: string[] | null = null;

  // 1. Tenta pegar o baseline salvo para o ciclo vigente
  if (data.history[currentCycle] && data.history[currentCycle].length > 0) {
    baseline = data.history[currentCycle];
  } else {
    // Se o ciclo vigente ainda não tiver registro (ex: virada sem acesso prévio),
    // pega o histórico mais recente disponível anterior ao ciclo atual
    const pastCycles = Object.keys(data.history)
      .filter((k) => k < currentCycle)
      .sort();
    
    if (pastCycles.length > 0) {
      baseline = data.history[pastCycles[pastCycles.length - 1]];
      // Salva para fixar no ciclo vigente
      data.history[currentCycle] = baseline;
    } else {
      baseline = INITIAL_BASELINE_TOP_10;
      data.history[currentCycle] = INITIAL_BASELINE_TOP_10;
    }
  }

  // 2. Pré-grava o ranking atual como baseline do PRÓXIMO ciclo semanal
  // Isso garante que ao gerar o chart na quinta às 21h, o ranking já fica salvo para a próxima semana,
  // funcionando mesmo que ninguém abra o site na sexta-feira.
  if (currentLiveTop10 && currentLiveTop10.length > 0) {
    const newTop10 = currentLiveTop10.slice(0, 10);
    let changed = false;

    if (!data.history[nextCycle] || data.history[nextCycle].length === 0) {
      data.history[nextCycle] = newTop10;
      data.activeCycle = currentCycle;
      changed = true;
    }

    if (changed) {
      await writeRankingHistory(data);
    }
  }

  return baseline && baseline.length > 0 ? baseline : INITIAL_BASELINE_TOP_10;
}
