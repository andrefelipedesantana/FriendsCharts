import React from "react";
import type { RankedListener } from "@/lib/chart-edition";
import { formatPlays, initialsOf } from "@/lib/format";
import { ChartImage } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type LeastListenerProps = {
  listener: RankedListener | null;
};

export function LeastListener({ listener }: LeastListenerProps) {
  return (
    <section aria-labelledby="chart-least-listener" className="flex flex-col">
      <SectionHeading
        id="chart-least-listener"
        title="Menor ouvinte"
        meta={listener ? `Nº ${listener.rank}` : undefined}
      />

      {!listener ? (
        <EmptyNote>Sem dados de ouvintes nesta semana</EmptyNote>
      ) : (
        <div className="flex flex-1 items-center gap-3 bg-sheet p-3 @poster:gap-3.5 @poster:p-3">
          <span className="relative h-11 w-11 shrink-0 @poster:h-12 @poster:w-12">
            <span className="block h-full w-full overflow-hidden rounded-full bg-ink">
              <ChartImage
                src={listener.avatar}
                alt={`Avatar de ${listener.user}`}
                fallback={
                  <span className="font-mono text-xs font-bold text-coral/70">
                    {initialsOf(listener.user)}
                  </span>
                }
              />
            </span>
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-coral/20 font-mono text-[9px] font-bold text-coral ring-1 ring-coral/40">
              {listener.rank}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-bold leading-tight text-paper @poster:text-[15px]">
                {listener.user}
              </span>
              <span className="shrink-0 bg-coral/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-coral">
                Lanterna
              </span>
            </div>

            <span className="mt-0.5 block font-mono text-[10px] text-sage @poster:text-[11px]">
              <span className="font-bold tabular-nums text-coral">
                {formatPlays(listener.playcount)}
              </span>{" "}
              plays · {listener.percentage}% do total
            </span>

            <span aria-hidden className="mt-1.5 block h-[3px] w-full bg-paper/10">
              <span
                className="block h-full bg-coral/70 transition-all"
                style={{ width: `${Math.max(listener.percentage, 2)}%` }}
              />
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
