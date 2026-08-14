import { unstable_cache } from "next/cache";

import { getAggregatedAlbums } from "@/lib/aggregators/albums";
import { getAggregatedArtists } from "@/lib/aggregators/artists";
import { getAggregatedTracks } from "@/lib/aggregators/tracks";
import { getPreviousWeekArtists } from "@/lib/aggregators/previous-artists";
import {
  compareRankings,
  leaderStatus,
  rankingKey,
  type RankMovement,
} from "@/lib/rank-movement";
import { getUserInfo } from "@/services/user-info.service";
import { users as participants } from "@/constants";

const TIME_ZONE = "America/Sao_Paulo";

export const ARTIST_RANKING_SIZE = 10;
export const TRACK_RANKING_SIZE = 6;
export const LISTENER_RANKING_SIZE = 3;
export const ALBUM_GRID_SIZE = 4;

export type ChartPeriod = {
  /** "30 JUL" */
  startLabel: string;
  /** "06 AGO" */
  endLabel: string;
  /** "30 JUL — 06 AGO" */
  label: string;
  /** "2026-08-06" — usado no nome do arquivo exportado. */
  isoEnd: string;
  /** Semana ISO do ano: vira o número da edição. */
  editionNumber: number;
};

export type ChartTotals = {
  plays: number;
  participants: number;
  rankedListeners: number;
};

export type RankedArtist = {
  rank: number;
  name: string;
  playcount: number;
  /** 0–1, proporcional ao líder do ranking. */
  share: number;
  topListener?: string;
  topListenerPlays?: number;
  topListenerAvatar?: string;
  /** Variação frente à semana anterior; `unknown` quando falta histórico. */
  movement: RankMovement;
  previousRank?: number;
};

export type RankedTrack = {
  rank: number;
  name: string;
  artist?: string;
  playcount: number;
  share: number;
  topListener?: string;
};

export type RankedAlbum = {
  rank: number;
  name: string;
  artist?: string;
  playcount: number;
  image?: string;
  topListener?: string;
  topListenerPlays?: number;
  topListenerAvatar?: string;
};

export type RankedListener = {
  rank: number;
  user: string;
  playcount: number;
  /** Percentual inteiro do total de plays do grupo. */
  percentage: number;
  avatar?: string;
};

export type ChartHeadliner = {
  name: string;
  playcount: number;
  topListener?: string;
  topListenerPlays?: number;
  topListenerAvatar?: string;
  /** Vantagem em plays sobre o 2º colocado (0 quando não há 2º). */
  leadOverRunnerUp: number;
  runnerUpName?: string;
  /** Capa de um álbum do mesmo artista — lastro visual quando não há foto enviada. */
  fallbackImage?: string;
  movement: RankMovement;
  previousRank?: number;
  /** "Manteve a liderança", "Subiu para o Nº 1"… `null` sem histórico. */
  statusMessage: string | null;
  /** Quem liderava na semana anterior e onde parou, quando a liderança mudou. */
  deposedLeader?: { name: string; currentRank: number | null };
};

export type ChartEdition = {
  period: ChartPeriod;
  totals: ChartTotals;
  headliner: ChartHeadliner | null;
  artists: RankedArtist[];
  tracks: RankedTrack[];
  featuredAlbum: RankedAlbum | null;
  albums: RankedAlbum[];
  listeners: RankedListener[];
  leastListener: RankedListener | null;
  /** Falso quando a semana anterior não pôde ser recuperada. */
  hasHistory: boolean;
  /** Artistas que estavam no Top 10 da semana passada e saíram. */
  exitedArtists: string[];
  /** Verdadeiro quando não há nenhum play na semana. */
  isEmpty: boolean;
};

/** Avatar determinístico quando o Last.fm não devolve imagem do usuário. */
export function fallbackAvatar(user: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user)}`;
}

async function fetchAvatar(user: string): Promise<string> {
  const info = await getUserInfo(user);
  const images: Array<{ size?: string; "#text"?: string }> = info?.image ?? [];
  const preferred =
    images.find((img) => img.size === "extralarge")?.["#text"] ||
    images.find((img) => img.size === "large")?.["#text"];

  return preferred || fallbackAvatar(user);
}

const getAvatar = unstable_cache(fetchAvatar, ["listener-avatar"], {
  revalidate: 86400,
  tags: ["listener-avatar"],
});

/** Uma chamada por usuário distinto, reaproveitada por todas as seções. */
async function resolveAvatars(usernames: Array<string | undefined>) {
  const unique = Array.from(new Set(usernames.filter((name): name is string => Boolean(name))));

  const entries = await Promise.all(
    unique.map(async (user) => {
      try {
        return [user, await getAvatar(user)] as const;
      } catch {
        return [user, fallbackAvatar(user)] as const;
      }
    })
  );

  return new Map(entries);
}

function partsOf(date: Date) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return { day: value("day"), month: value("month"), year: value("year") };
}

function shortLabel(date: Date) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
  });

  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = (parts.find((part) => part.type === "month")?.value ?? "").replace(".", "");

  return `${day} ${month}`.toUpperCase();
}

/** Semana ISO-8601 do ano — o número da edição vem daqui. */
function isoWeek({ day, month, year }: { day: number; month: number; year: number }) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function buildPeriod(reference = new Date()): ChartPeriod {
  const end = reference;
  const start = new Date(reference);
  start.setDate(reference.getDate() - 7);

  const { day, month, year } = partsOf(end);
  const startLabel = shortLabel(start);
  const endLabel = shortLabel(end);

  return {
    startLabel,
    endLabel,
    label: `${startLabel} — ${endLabel}`,
    isoEnd: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    editionNumber: isoWeek({ day, month, year }),
  };
}

function shareOf(playcount: number, leader: number) {
  if (leader <= 0) return 0;
  return Math.min(playcount / leader, 1);
}

/**
 * Monta a edição inteira a partir dos agregadores. É a única fonte de
 * ordenação, percentual e formatação de período — página, prévia e imagem
 * exportada consomem exatamente este objeto.
 */
export async function getChartEdition(reference = new Date()): Promise<ChartEdition> {
  const [tracksData, albumsData, artistsData] = await Promise.all([
    getAggregatedTracks(),
    getAggregatedAlbums(),
    getAggregatedArtists(),
  ]);

  const rawArtists = artistsData.artists.slice(0, ARTIST_RANKING_SIZE);
  const previousArtists = await getPreviousWeekArtists(rawArtists.map((a) => a.name)).catch(
    () => ({ artists: [], available: false })
  );

  const rawTracks = tracksData.tracks.slice(0, TRACK_RANKING_SIZE);
  const rawAlbums = albumsData.albums;
  const rawListeners = tracksData.users.slice(0, LISTENER_RANKING_SIZE);
  const rawLeastListener =
    tracksData.users.length > 0 ? tracksData.users[tracksData.users.length - 1] : null;

  const avatars = await resolveAvatars([
    ...rawListeners.map((listener) => listener.user),
    rawLeastListener?.user,
    ...rawArtists.map((artist) => artist.topListener),
    ...rawAlbums.slice(0, 1).map((album) => album.topListener),
  ]);

  // Comparação com a semana anterior dentro do mesmo Top N, sem tocar na
  // ordenação atual: `rawArtists` já vem ordenado por plays.
  const comparison = compareRankings(
    rawArtists.map((artist) => artist.name),
    previousArtists.available
      ? previousArtists.artists.slice(0, ARTIST_RANKING_SIZE).map((artist) => artist.name)
      : null
  );

  const artistLeader = rawArtists[0]?.playcount ?? 0;
  const artists: RankedArtist[] = rawArtists.map((artist, index) => ({
    rank: index + 1,
    name: artist.name,
    playcount: artist.playcount,
    share: shareOf(artist.playcount, artistLeader),
    topListener: artist.topListener,
    topListenerPlays: artist.topListenerPlays,
    topListenerAvatar: artist.topListener ? avatars.get(artist.topListener) : undefined,
    movement: comparison.movements.get(rankingKey(artist.name)) ?? { kind: "unknown" },
    previousRank: comparison.previousRanks.get(rankingKey(artist.name)),
  }));

  const trackLeader = rawTracks[0]?.playcount ?? 0;
  const tracks: RankedTrack[] = rawTracks.map((track, index) => ({
    rank: index + 1,
    name: track.name,
    artist: track.artist,
    playcount: track.playcount,
    share: shareOf(track.playcount, trackLeader),
    topListener: track.topListener,
  }));

  const toAlbum = (album: (typeof rawAlbums)[number], index: number): RankedAlbum => ({
    rank: index + 1,
    name: album.name,
    artist: album.artist,
    playcount: album.playcount,
    image: album.image || undefined,
    topListener: album.topListener,
    topListenerPlays: album.topListenerPlays,
    topListenerAvatar: album.topListener ? avatars.get(album.topListener) : undefined,
  });

  const allAlbums = rawAlbums.map(toAlbum);
  const featuredAlbum = allAlbums[0] ?? null;
  const albums = allAlbums.slice(1, 1 + ALBUM_GRID_SIZE);

  const listeners: RankedListener[] = rawListeners.map((listener, index) => ({
    rank: index + 1,
    user: listener.user,
    playcount: listener.playcount,
    percentage:
      tracksData.totalPlays > 0
        ? Math.round((listener.playcount / tracksData.totalPlays) * 100)
        : 0,
    avatar: avatars.get(listener.user),
  }));

  const leastListener: RankedListener | null = rawLeastListener
    ? {
        rank: tracksData.users.length,
        user: rawLeastListener.user,
        playcount: rawLeastListener.playcount,
        percentage:
          tracksData.totalPlays > 0
            ? Math.round((rawLeastListener.playcount / tracksData.totalPlays) * 100)
            : 0,
        avatar: avatars.get(rawLeastListener.user),
      }
    : null;

  const leader = artists[0];
  const runnerUp = artists[1];

  // Quem liderava antes e onde parou — só interessa quando a liderança trocou.
  const previousLeader = comparison.previousLeader;
  const deposedLeader =
    previousLeader && leader && rankingKey(previousLeader) !== rankingKey(leader.name)
      ? {
          name: previousLeader,
          currentRank:
            artists.find((artist) => rankingKey(artist.name) === rankingKey(previousLeader))?.rank ??
            null,
        }
      : undefined;

  const headliner: ChartHeadliner | null = leader
    ? {
        name: leader.name,
        playcount: leader.playcount,
        topListener: leader.topListener,
        topListenerPlays: leader.topListenerPlays,
        topListenerAvatar: leader.topListenerAvatar,
        leadOverRunnerUp: runnerUp ? leader.playcount - runnerUp.playcount : 0,
        runnerUpName: runnerUp?.name,
        fallbackImage: allAlbums.find(
          (album) => album.artist && album.artist.toLowerCase() === leader.name.toLowerCase()
        )?.image,
        movement: leader.movement,
        previousRank: leader.previousRank,
        statusMessage: leaderStatus(leader.movement),
        deposedLeader,
      }
    : null;

  return {
    period: buildPeriod(reference),
    totals: {
      plays: tracksData.totalPlays,
      participants: participants.length,
      rankedListeners: listeners.length,
    },
    headliner,
    artists,
    tracks,
    featuredAlbum,
    albums,
    listeners,
    leastListener,
    hasHistory: comparison.hasHistory,
    exitedArtists: comparison.exited,
    isEmpty: artists.length === 0 && tracks.length === 0 && allAlbums.length === 0,
  };
}
