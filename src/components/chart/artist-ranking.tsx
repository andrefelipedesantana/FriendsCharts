import type { RankedArtist } from "@/lib/chart-edition";
import { formatPlays, formatRank } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RankMovementBadge } from "./rank-movement-badge";
import { EmptyNote, SectionHeading } from "./section-heading";

type ArtistRankingProps = {
  artists: RankedArtist[];
  /** Falso quando a semana anterior não pôde ser recuperada. */
  hasHistory: boolean;
  /** Nomes que caíram fora do Top 10 desde a edição passada. */
  exited?: string[];
};

const MAX_EXITED_SHOWN = 3;

/**
 * A própria linha é a barra: o preenchimento verde atrás do conteúdo é
 * proporcional aos plays do líder, então o ranking se lê como gráfico.
 */
export function ArtistRanking({ artists, hasHistory, exited = [] }: ArtistRankingProps) {
  const total = artists.length || 10;
  const shownExits = exited.slice(0, MAX_EXITED_SHOWN);
  const remainingExits = exited.length - shownExits.length;

  return (
    <section aria-labelledby="chart-artists" className="flex flex-col">
      <SectionHeading
        id="chart-artists"
        title="Artistas"
        meta={hasHistory ? `Top ${total} · vs. semana anterior` : `Top ${total} · sem histórico`}
      />

      {artists.length === 0 ? (
        <EmptyNote>Nenhum artista escutado nesta semana</EmptyNote>
      ) : (
        <>
          <ol className="flex flex-col">
            {artists.map((artist) => {
              const isLeader = artist.rank === 1;

              return (
                <li
                  key={`${artist.rank}-${artist.name}`}
                  className="relative flex h-[42px] items-center gap-2.5 border-b border-paper/[0.07] px-2 last:border-b-0 @poster:h-[34px] @poster:gap-2.5 @poster:px-2.5"
                >
                  <span
                    aria-hidden
                    style={{ width: `${Math.max(artist.share * 100, 2)}%` }}
                    className={cn(
                      "absolute inset-y-0 left-0 border-r-2",
                      isLeader ? "border-signal bg-signal/28" : "border-signal/70 bg-signal/[0.13]"
                    )}
                  />

                  <span
                    className={cn(
                      "relative w-6 shrink-0 font-mono text-[11px] tabular-nums @poster:text-[12px]",
                      isLeader ? "font-bold text-signal" : "text-sage"
                    )}
                  >
                    {formatRank(artist.rank)}
                  </span>

                  <span className="relative min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate leading-tight text-paper",
                        isLeader
                          ? "text-[16px] font-black @poster:text-[17px]"
                          : "text-[14px] font-bold @poster:text-[15px]"
                      )}
                    >
                      {artist.name}
                    </span>
                    {artist.topListener ? (
                      <span className="block truncate font-mono text-[9px] text-brass @poster:hidden">
                        {artist.topListener}
                      </span>
                    ) : null}
                  </span>

                  {artist.topListener ? (
                    <span className="relative hidden max-w-[112px] shrink-0 truncate font-mono text-[11px] text-brass @poster:block">
                      {artist.topListener}
                    </span>
                  ) : null}

                  <span
                    className={cn(
                      "relative shrink-0 font-mono text-[13px] tabular-nums text-signal @poster:text-[14px]",
                      isLeader ? "font-bold" : "font-semibold"
                    )}
                  >
                    {formatPlays(artist.playcount)}
                  </span>

                  {hasHistory ? (
                    <RankMovementBadge movement={artist.movement} className="relative w-[34px]" />
                  ) : null}
                </li>
              );
            })}
          </ol>

          {shownExits.length > 0 ? (
            <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-sage @poster:text-[10px]">
              Saíram do top {total}:{" "}
              <span className="text-paper/75">{shownExits.join(" · ")}</span>
              {remainingExits > 0 ? ` · +${remainingExits}` : null}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
