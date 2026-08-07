import type { RankedTrack } from "@/lib/chart-edition";
import { formatPlays, formatRank } from "@/lib/format";
import { EmptyNote, SectionHeading } from "./section-heading";

type TrackRankingProps = {
  tracks: RankedTrack[];
};

/**
 * Sem capas por faixa na API do Last.fm: no lugar de espaço vazio, o filete
 * inferior de cada linha é cortado na proporção dos plays.
 */
export function TrackRanking({ tracks }: TrackRankingProps) {
  return (
    <section aria-labelledby="chart-tracks">
      <SectionHeading id="chart-tracks" title="Músicas" meta={`Top ${tracks.length || 6}`} />

      {tracks.length === 0 ? (
        <EmptyNote>Nenhuma música escutada nesta semana</EmptyNote>
      ) : (
        <ol className="flex flex-col">
          {tracks.map((track) => (
            <li
              key={`${track.rank}-${track.name}-${track.artist ?? ""}`}
              className="relative flex items-center gap-2.5 border-b-2 border-paper/[0.06] py-2 @poster:gap-3 @poster:py-[9px]"
            >
              <span className="w-5 shrink-0 self-start pt-0.5 font-mono text-[11px] tabular-nums text-sage @poster:text-[12px]">
                {formatRank(track.rank)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold leading-tight text-paper @poster:text-[15px]">
                  {track.name}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] leading-tight text-sage @poster:text-[11px]">
                  {track.artist || "Artista desconhecido"}
                  {track.topListener ? (
                    <>
                      {" · "}
                      <span className="text-brass">{track.topListener}</span>
                    </>
                  ) : null}
                </span>
              </span>

              <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-signal @poster:text-[14px]">
                {formatPlays(track.playcount)}
                <span className="text-sage">×</span>
              </span>

              <span
                aria-hidden
                style={{ width: `${Math.max(track.share * 100, 2)}%` }}
                className="absolute bottom-[-2px] left-0 h-[2px] bg-signal"
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
