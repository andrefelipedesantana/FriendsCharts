/** Formatação de dados exibidos no chart — usada por página e exportação. */

export function formatPlays(value: number) {
  return value.toLocaleString("pt-BR");
}

export function formatRank(rank: number) {
  return String(rank).padStart(2, "0");
}

/** Iniciais para o fallback tipográfico quando não há imagem. */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
