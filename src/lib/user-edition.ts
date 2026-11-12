import { users } from "@/constants";
import { getAggregatedArtists } from "@/lib/aggregators/artists";
import { getUserWeek, weekWindows, type UserWeek } from "@/lib/aggregators/user-week";
import { buildPeriod, resolveAvatars, type ChartPeriod } from "@/lib/chart-edition";
import { compareRankings, movementBetween, rankingKey, type RankMovement } from "@/lib/rank-movement";
import { getTopAlbums } from "@/services/top-album.service";

export const USER_ARTIST_SIZE = 5;
export const USER_TRACK_SIZE = 5;

export type UserRankedItem = {
  rank: number;
  name: string;
  artist?: string;
  playcount: number;
  /** 0–1, proporcional ao primeiro da lista. */
  share: number;
  /** Variação frente à semana anterior da própria pessoa; `unknown` sem dados. */
  movement: RankMovement;
  previousRank?: number;
  /** Posição no Top 10 do chart do grupo (só aparece no modo grupo). */
  groupRank?: number;
};

/** Edição pessoal, sem nenhuma referência ao grupo — vai para o story. */
export type UserSoloEdition = {
  user: string;
  avatar?: string;
  period: ChartPeriod;
  totals: { plays: number; artists: number; tracks: number };
  topArtist: (UserRankedItem & { percentage: number; image?: string }) | null;
  topAlbum: { name: string; artist?: string; playcount: number; image?: string } | null;
  artists: UserRankedItem[];
  tracks: UserRankedItem[];
  /** Falso quando a semana anterior não pôde ser lida: nenhuma seta é exibida. */
  hasHistory: boolean;
  isEmpty: boolean;
};

export type UserGroupContext = {
  groupPlays: number;
  memberCount: number;
  /** Posição entre quem ouviu algo na semana; `null` se não deu para calcular. */
  listenerRank: number | null;
  listenerMovement: RankMovement;
  rankedListeners: number;
  /** Percentual inteiro dos plays do grupo. */
  percentage: number;
  /** Artistas do Top 10 do grupo em que a pessoa foi a maior ouvinte. */
  carried: Array<{ name: string; groupRank: number; userPlays: number; groupPlays: number }>;
  /** Contribuição para o Nº 1 do grupo. */
  groupLeader: { name: string; userPlays: number; groupPlays: number } | null;
  /** Artista mais ouvido que ninguém mais do grupo ouviu. */
  exclusive: { name: string; playcount: number } | null;
  /** Amigo com o gosto mais parecido na semana. */
  affinity: { user: string; avatar?: string; score: number; shared: string[] } | null;
};

export type UserEdition = {
  solo: UserSoloEdition;
  group: UserGroupContext;
};

/** Nome canônico do participante a partir da URL (case-insensitive). */
export function findParticipant(slug: string) {
  const wanted = decodeURIComponent(slug).trim().toLowerCase();
  return users.find((user) => user.toLowerCase() === wanted) ?? null;
}

function shareOf(value: number, leader: number) {
  return leader > 0 ? Math.min(value / leader, 1) : 0;
}

const trackKey = (track: { name: string; artist?: string }) => `${track.name}:::${track.artist ?? ""}`;

/** Similaridade de cosseno entre os plays por artista de duas pessoas. */
function similarity(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  for (const [key, plays] of a) dot += plays * (b.get(key) ?? 0);
  if (dot === 0) return 0;

  const norm = (m: Map<string, number>) =>
    Math.sqrt(Array.from(m.values()).reduce((sum, v) => sum + v * v, 0));

  return dot / (norm(a) * norm(b));
}

function artistVector(week: UserWeek) {
  const vector = new Map<string, number>();
  for (const artist of week.artists) {
    const key = rankingKey(artist.name);
    vector.set(key, (vector.get(key) ?? 0) + artist.playcount);
  }
  return vector;
}

/** Posições de ouvintes (1-based) — só quando todas as semanas foram lidas. */
function listenerRanks(weeks: Array<UserWeek | null>) {
  if (weeks.some((week) => week === null)) return null;

  const ranked = (weeks as UserWeek[])
    .filter((week) => week.plays > 0)
    .sort((a, b) => b.plays - a.plays || a.user.localeCompare(b.user));

  return new Map(ranked.map((week, index) => [week.user, index + 1]));
}

/** Capas vêm do `gettopalbums` (o chart semanal não traz imagem). */
async function albumCovers(user: string) {
  try {
    const albums: Array<{
      name: string;
      artist?: { name?: string };
      image?: Array<{ size?: string; "#text"?: string }>;
    }> = (await getTopAlbums(user)) ?? [];

    const covers = new Map<string, string>();
    for (const album of albums) {
      const image = album.image?.find((img) => img.size === "extralarge" || img.size === "large")?.[
        "#text"
      ];
      if (image) covers.set(rankingKey(`${album.name}:::${album.artist?.name ?? ""}`), image);
    }
    return covers;
  } catch {
    return new Map<string, string>();
  }
}

export class UserWeekUnavailableError extends Error {}

export async function getUserEdition(user: string, reference = new Date()): Promise<UserEdition> {
  const windows = weekWindows(reference);

  const [currentWeeks, previousWeeks, groupArtists, covers] = await Promise.all([
    Promise.all(users.map((member) => getUserWeek(member, windows.current))),
    Promise.all(users.map((member) => getUserWeek(member, windows.previous))),
    getAggregatedArtists(),
    albumCovers(user),
  ]);

  const memberIndex = users.indexOf(user);
  const current = currentWeeks[memberIndex];
  const previous = previousWeeks[memberIndex];

  // Sem a semana atual não há chart — melhor um erro claro do que uma peça vazia.
  if (!current) {
    throw new UserWeekUnavailableError(`Não foi possível ler a semana de ${user} no Last.fm.`);
  }

  const groupTop = groupArtists.artists.slice(0, 10);
  const groupRankOf = new Map(groupTop.map((artist, index) => [rankingKey(artist.name), index + 1]));

  // --- Solo: comparação contra o ranking COMPLETO da semana anterior ----------
  // (não só o Top 5), para que quem era Nº 8 e subiu para Nº 3 apareça como ▲5,
  // e não como "NOVO".
  const topArtists = current.artists.slice(0, USER_ARTIST_SIZE);
  const artistComparison = compareRankings(
    topArtists.map((artist) => artist.name),
    previous ? previous.artists.map((artist) => artist.name) : null
  );

  const topTracks = current.tracks.slice(0, USER_TRACK_SIZE);
  const trackComparison = compareRankings(
    topTracks.map(trackKey),
    previous ? previous.tracks.map(trackKey) : null
  );

  const artistLeader = topArtists[0]?.playcount ?? 0;
  const artists: UserRankedItem[] = topArtists.map((artist, index) => ({
    rank: index + 1,
    name: artist.name,
    playcount: artist.playcount,
    share: shareOf(artist.playcount, artistLeader),
    movement: artistComparison.movements.get(rankingKey(artist.name)) ?? { kind: "unknown" },
    previousRank: artistComparison.previousRanks.get(rankingKey(artist.name)),
    groupRank: groupRankOf.get(rankingKey(artist.name)),
  }));

  const trackLeader = topTracks[0]?.playcount ?? 0;
  const tracks: UserRankedItem[] = topTracks.map((track, index) => ({
    rank: index + 1,
    name: track.name,
    artist: track.artist,
    playcount: track.playcount,
    share: shareOf(track.playcount, trackLeader),
    movement: trackComparison.movements.get(rankingKey(trackKey(track))) ?? { kind: "unknown" },
    previousRank: trackComparison.previousRanks.get(rankingKey(trackKey(track))),
  }));

  const coverOf = (name: string, artist?: string) => covers.get(rankingKey(`${name}:::${artist ?? ""}`));

  const firstAlbum = current.albums[0];
  const topAlbum = firstAlbum
    ? {
        name: firstAlbum.name,
        artist: firstAlbum.artist,
        playcount: firstAlbum.playcount,
        image: coverOf(firstAlbum.name, firstAlbum.artist),
      }
    : null;

  const leader = artists[0];
  const leaderAlbum = leader
    ? current.albums.find(
        (album) =>
          album.artist &&
          rankingKey(album.artist) === rankingKey(leader.name) &&
          coverOf(album.name, album.artist)
      )
    : undefined;

  const topArtist = leader
    ? {
        ...leader,
        percentage: current.plays > 0 ? Math.round((leader.playcount / current.plays) * 100) : 0,
        image: leaderAlbum ? coverOf(leaderAlbum.name, leaderAlbum.artist) : undefined,
      }
    : null;

  // --- Grupo ------------------------------------------------------------------
  const currentRanks = listenerRanks(currentWeeks);
  const previousRanks = listenerRanks(previousWeeks);
  const listenerRank = currentRanks?.get(user) ?? null;
  const listenerMovement: RankMovement =
    listenerRank === null || previousRanks === null
      ? { kind: "unknown" }
      : movementBetween(listenerRank, previousRanks.get(user));

  const groupPlays = currentWeeks.reduce((sum, week) => sum + (week?.plays ?? 0), 0);

  const carried = groupTop
    .map((artist, index) => ({ artist, groupRank: index + 1 }))
    .filter(({ artist }) => artist.topListener === user)
    .map(({ artist, groupRank }) => ({
      name: artist.name,
      groupRank,
      userPlays: artist.topListenerPlays ?? 0,
      groupPlays: artist.playcount,
    }));

  const userVector = artistVector(current);
  const groupNumberOne = groupTop[0];
  const groupLeader = groupNumberOne
    ? {
        name: groupNumberOne.name,
        userPlays: userVector.get(rankingKey(groupNumberOne.name)) ?? 0,
        groupPlays: groupNumberOne.playcount,
      }
    : null;

  const others = currentWeeks.filter(
    (week): week is UserWeek => week !== null && week.user !== user
  );

  // "Só você ouviu" exige a semana de todo mundo: com alguém faltando, a
  // afirmação poderia ser falsa — então não aparece.
  const everyoneLoaded = currentWeeks.every((week) => week !== null);
  const heardByOthers = new Set(others.flatMap((week) => week.artists.map((a) => rankingKey(a.name))));
  const exclusiveArtist = everyoneLoaded
    ? current.artists.find((artist) => !heardByOthers.has(rankingKey(artist.name)))
    : undefined;

  const bestMatch = others
    .map((week) => ({ week, vector: artistVector(week), score: 0 }))
    .map((match) => ({ ...match, score: similarity(userVector, match.vector) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.week.user.localeCompare(b.week.user))[0];

  const affinityShared = bestMatch
    ? current.artists
        .filter((artist) => bestMatch.vector.has(rankingKey(artist.name)))
        .map((artist) => ({
          name: artist.name,
          weight: Math.min(artist.playcount, bestMatch.vector.get(rankingKey(artist.name)) ?? 0),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map((artist) => artist.name)
    : [];

  const avatars = await resolveAvatars([user, bestMatch?.week.user]);

  return {
    solo: {
      user,
      avatar: avatars.get(user),
      period: buildPeriod(reference),
      totals: {
        plays: current.plays,
        artists: current.artists.length,
        tracks: current.tracks.length,
      },
      topArtist,
      topAlbum,
      artists,
      tracks,
      hasHistory: artistComparison.hasHistory,
      isEmpty: current.plays === 0 && current.artists.length === 0,
    },
    group: {
      groupPlays,
      memberCount: users.length,
      listenerRank,
      listenerMovement,
      rankedListeners: currentRanks?.size ?? 0,
      percentage: groupPlays > 0 ? Math.round((current.plays / groupPlays) * 100) : 0,
      carried,
      groupLeader,
      exclusive: exclusiveArtist
        ? { name: exclusiveArtist.name, playcount: exclusiveArtist.playcount }
        : null,
      affinity: bestMatch
        ? {
            user: bestMatch.week.user,
            avatar: avatars.get(bestMatch.week.user),
            score: Math.round(bestMatch.score * 100),
            shared: affinityShared,
          }
        : null,
    },
  };
}
