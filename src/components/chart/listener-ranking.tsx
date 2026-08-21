import type { RankedListener } from "@/lib/chart-edition";
import { formatPlays, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChartImage } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type ListenerRankingProps = {
  listeners: RankedListener[];
  /** Quem menos ouviu — fecha a fileira, com o mesmo peso do pódio. */
  leastListener?: RankedListener | null;
};

/**
 * Pódio e lanterna na mesma fileira: os três primeiros abrem, o menos ativo
 * encerra. Todos os cartões têm o mesmo tamanho — o que muda é a cor.
 */
export function ListenerRanking({ listeners, leastListener }: ListenerRankingProps) {
  // O lanterna só entra se já não estiver no pódio (grupos de 3 ou menos).
  const showsLeast =
    Boolean(leastListener) && !listeners.some((listener) => listener.user === leastListener!.user);

  const rows = showsLeast
    ? [...listeners.map((l) => ({ listener: l, isLeast: false })), { listener: leastListener!, isLeast: true }]
    : listeners.map((l) => ({ listener: l, isLeast: false }));

  return (
    <section aria-labelledby="chart-listeners" className="flex flex-col">
      <SectionHeading
        id="chart-listeners"
        title="Ouvintes da semana"
        meta={
          listeners.length > 0
            ? showsLeast
              ? `Top ${listeners.length} + lanterna`
              : `Top ${listeners.length}`
            : undefined
        }
      />

      {rows.length === 0 ? (
        <EmptyNote>Nenhum play registrado nesta semana</EmptyNote>
      ) : (
        <ol
          className={cn(
            "grid flex-1 gap-2 @poster:gap-3",
            rows.length > 3 ? "@chart:grid-cols-4" : "@chart:grid-cols-3"
          )}
        >
          {rows.map(({ listener, isLeast }) => (
            <li
              key={listener.user}
              className={cn(
                "flex h-full items-center gap-2.5 bg-sheet p-2.5 @poster:p-3",
                isLeast && "ring-1 ring-coral/40"
              )}
            >
              <span className="relative h-11 w-11 shrink-0">
                <span className="block h-full w-full overflow-hidden rounded-full bg-ink">
                  <ChartImage
                    src={listener.avatar}
                    alt=""
                    fallback={
                      <span
                        className={cn(
                          "font-mono text-xs font-bold",
                          isLeast ? "text-coral/70" : "text-signal/70"
                        )}
                      >
                        {initialsOf(listener.user)}
                      </span>
                    }
                  />
                </span>
                <span
                  className={cn(
                    "absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full font-mono text-[9px] font-bold",
                    isLeast ? "bg-coral/20 text-coral ring-1 ring-coral/40" : "bg-brass text-ink"
                  )}
                >
                  {listener.rank}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="min-w-0 truncate text-[14px] font-bold leading-tight text-paper @poster:text-[15px]">
                    {listener.user}
                  </span>
                  {isLeast ? (
                    <span className="shrink-0 bg-coral/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-coral">
                      Lanterna
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-sage @poster:text-[11px]">
                  <span
                    className={cn(
                      "font-bold tabular-nums",
                      isLeast ? "text-coral" : "text-signal"
                    )}
                  >
                    {formatPlays(listener.playcount)}
                  </span>{" "}
                  plays · {listener.percentage}%
                </span>
                <span aria-hidden className="mt-1.5 block h-[3px] w-full bg-paper/10">
                  <span
                    className={cn("block h-full", isLeast ? "bg-coral/70" : "bg-signal")}
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
