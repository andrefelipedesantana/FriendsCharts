import type { ChartPeriod } from "@/lib/chart-edition";

type ChartFooterProps = {
  period: ChartPeriod;
};

export function ChartFooter({ period }: ChartFooterProps) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-paper/15 pt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-sage @poster:text-[10px]">
      <span className="font-bold text-paper/80">FriendCharts</span>
      <span>
        Edição Nº {period.editionNumber} · {period.label}
      </span>
      <span>Dados Last.fm</span>
    </footer>
  );
}
