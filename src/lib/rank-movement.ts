/**
 * Comparação de posições entre a edição atual e a anterior.
 *
 * Módulo puro e sem dependências: a mesma função alimenta a página, a prévia
 * e a imagem exportada, então não existe cálculo de variação duplicado.
 *
 * Semântica de chart: a comparação é feita **dentro do Top N**. Quem não
 * estava no Top N da semana passada entra como `new`; quem estava e não está
 * mais é reportado em `exited`.
 */

export type RankMovement =
  | { kind: "up"; positions: number }
  | { kind: "down"; positions: number }
  | { kind: "same" }
  | { kind: "new" }
  /** Sem histórico suficiente — nunca exibir variação neste caso. */
  | { kind: "unknown" };

export type RankingComparison = {
  hasHistory: boolean;
  /** Chaveado por `rankingKey(name)`. */
  movements: Map<string, RankMovement>;
  previousRanks: Map<string, number>;
  /** Nomes que estavam no ranking anterior e saíram, na ordem em que estavam. */
  exited: string[];
  /** Nome que liderava a edição anterior, se houver. */
  previousLeader?: string;
};

/** Normaliza o nome para casar entre semanas (Last.fm varia maiúsculas). */
export function rankingKey(name: string) {
  return name.trim().toLowerCase();
}

export function movementBetween(currentRank: number, previousRank?: number): RankMovement {
  if (previousRank === undefined) return { kind: "new" };
  if (previousRank === currentRank) return { kind: "same" };

  return previousRank > currentRank
    ? { kind: "up", positions: previousRank - currentRank }
    : { kind: "down", positions: currentRank - previousRank };
}

/**
 * Cruza as duas listas ordenadas. Não reordena nada: a posição atual é
 * exatamente a que entrou em `currentNames`.
 */
export function compareRankings(
  currentNames: string[],
  previousNames: string[] | null | undefined
): RankingComparison {
  const movements = new Map<string, RankMovement>();

  if (!previousNames || previousNames.length === 0) {
    for (const name of currentNames) {
      movements.set(rankingKey(name), { kind: "unknown" });
    }

    return { hasHistory: false, movements, previousRanks: new Map(), exited: [] };
  }

  const previousRanks = new Map<string, number>();
  previousNames.forEach((name, index) => {
    const key = rankingKey(name);
    if (!previousRanks.has(key)) previousRanks.set(key, index + 1);
  });

  currentNames.forEach((name, index) => {
    const key = rankingKey(name);
    movements.set(key, movementBetween(index + 1, previousRanks.get(key)));
  });

  const currentKeys = new Set(currentNames.map(rankingKey));

  return {
    hasHistory: true,
    movements,
    previousRanks,
    exited: previousNames.filter((name) => !currentKeys.has(rankingKey(name))),
    previousLeader: previousNames[0],
  };
}

/** Texto para leitores de tela e tooltip — nunca depende só da cor. */
export function movementLabel(movement: RankMovement) {
  switch (movement.kind) {
    case "up":
      return `Subiu ${movement.positions} ${movement.positions === 1 ? "posição" : "posições"}`;
    case "down":
      return `Caiu ${movement.positions} ${movement.positions === 1 ? "posição" : "posições"}`;
    case "same":
      return "Manteve a posição";
    case "new":
      return "Novo no ranking";
    case "unknown":
      return "Sem dados da semana anterior";
  }
}

/** Mensagem contextual do artista Nº 1. */
export function leaderStatus(movement: RankMovement) {
  switch (movement.kind) {
    case "same":
      return "Manteve a liderança";
    case "up":
      return "Subiu para o Nº 1";
    case "new":
      return "Novo líder da semana";
    case "down":
    case "unknown":
      return null;
  }
}
