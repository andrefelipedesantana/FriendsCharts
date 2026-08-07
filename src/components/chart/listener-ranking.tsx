import type { RankedListener } from "@/lib/chart-edition";
import { formatPlays, initialsOf } from "@/lib/format";
import { ChartImage } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type ListenerRankingProps = {
  listeners: RankedListener[];
};

export function ListenerRanking({ listeners }: ListenerRankingProps) {
  return (
    <section aria-labelledby="chart-listeners" className="flex flex-col">
      <SectionHeading
        id="chart-listeners"
        title="Ouvintes da semana"
        meta={listeners.length > 0 ? `Top ${listeners.length}` : undefined}
      />

      {listeners.length === 0 ? (
        <EmptyNote>Nenhum play registrado nesta semana</EmptyNote>
      ) : (
        <ol className="grid flex-1 gap-2 @chart:grid-cols-3 @poster:gap-3">
          {listeners.map((listener) => (
            <li
              key={listener.user}
              className="flex h-full items-center gap-2.5 bg-sheet p-2.5 @poster:p-3"
            >
              <span className="relative h-11 w-11 shrink-0">
                <span className="block h-full w-full overflow-hidden rounded-full bg-ink">
                  <ChartImage
                    src={listener.avatar}
                    alt=""
                    fallback={
                      <span className="font-mono text-xs font-bold text-signal/70">
                        {initialsOf(listener.user)}
                      </span>
                    }
                  />
                </span>
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brass font-mono text-[9px] font-bold text-ink">
                  {listener.rank}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold leading-tight text-paper @poster:text-[15px]">
                  {listener.user}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-sage @poster:text-[11px]">
                  <span className="font-bold tabular-nums text-signal">
                    {formatPlays(listener.playcount)}
                  </span>{" "}
                  plays · {listener.percentage}%
                </span>
                <span aria-hidden className="mt-1.5 block h-[3px] w-full bg-paper/10">
                  <span
                    className="block h-full bg-signal"
                    style={{ width: `${Math.max(listener.percentage, 2)}%` }}
                  />
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
