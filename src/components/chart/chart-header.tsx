import type { ChartPeriod, ChartTotals } from "@/lib/chart-edition";
import { formatPlays } from "@/lib/format";

type ChartHeaderProps = {
  period: ChartPeriod;
  totals: ChartTotals;
};

export function ChartHeader({ period, totals }: ChartHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center bg-signal text-ink @poster:h-8 @poster:w-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 @poster:h-[18px] @poster:w-[18px]"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-paper @poster:text-[13px]">
            FriendCharts
          </span>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-sage @poster:text-[11px]">
          Edição semanal · Nº {period.editionNumber}
        </span>
      </div>

      <div aria-hidden className="mt-3 h-[3px] w-full bg-signal @poster:mt-4" />

      <div className="mt-3 flex flex-col gap-2.5 @poster:mt-5 @poster:flex-row @poster:items-end @poster:justify-between @poster:gap-8">
        <h1 className="text-[34px] font-black uppercase leading-[0.85] tracking-[-0.035em] text-paper @chart:text-[44px] @poster:text-[56px]">
          Charts da semana
        </h1>

        <div className="shrink-0 font-mono uppercase @poster:pb-1.5 @poster:text-right">
          <p className="text-[12px] font-bold tracking-[0.14em] text-paper @poster:text-[14px]">
            {period.label}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.14em] text-sage @poster:text-[11px]">
            <span className="text-signal">{formatPlays(totals.plays)}</span> plays ·{" "}
            <span className="text-signal">{totals.participants}</span> ouvintes
          </p>
        </div>
      </div>
    </header>
  );
}
