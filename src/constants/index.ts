export const users = ["candygor", "vitoriaforttes", "Felipetas", "edu_xs", "cocodilhaatomic", "becamusics", "akumakoji", "guswlima", "llucasmoreno5", "brunocosta061", "fontes_vinicius", "erikbzra", "piscixxx"];

/** Fora do ranking de artistas: playlists de ruído branco distorcem o chart. */
export const EXCLUDED_ARTISTS = ["Música Para Estudar"];

export const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};