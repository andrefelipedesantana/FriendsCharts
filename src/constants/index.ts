export const users = [
  "candygor",
  "vitoriaforttes",
  "Felipetas",
  "edu_xs",
  "cocodilhaatomic",
  "becamusics",
  "akumakoji",
  "guswlima",
  "llucasmoreno5",
  "brunocosta061",
  "fontes_vinicius",
  "erikbzra",
  "piscixxx",
];

/**
 * Top 10 da última semana fechada (extraído na quinta-feira).
 * Serve como base comparativa para calcular quem subiu (▲), desceu (▼), saiu do ranking ou é novo.
 * Toda quinta-feira à noite, ao exportar o novo chart, substitua este array pelo ranking da semana.
 */
export const PREVIOUS_TOP_10 = [
  "Lana Del Rey",
  "Beyoncé",
  "ADÉLA",
  "Ariana Grande",
  "Daniela Mercury",
  "Rebecca Black",
  "Miley Cyrus",
  "Kyra Machida",
  "Margareth Menezes",
  "Vita",
];

/** Fora do ranking de artistas: playlists de ruído branco distorcem o chart. */
export const EXCLUDED_ARTISTS = ["Música Para Estudar"];

export const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};