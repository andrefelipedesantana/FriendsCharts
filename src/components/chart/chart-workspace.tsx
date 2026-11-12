"use client";

import { useState } from "react";
import Link from "next/link";

import type { ChartEdition } from "@/lib/chart-edition";
import { ExportChartButton } from "@/components/export/export-chart-button";
import { WeeklyChart } from "./weekly-chart";

type ChartWorkspaceProps = {
  edition: ChartEdition;
};

/**
 * Dono da foto do artista Nº 1. A mesma foto alimenta a peça da página e a
 * prévia do modal — que é exatamente o nó exportado.
 */
export function ChartWorkspace({ edition }: ChartWorkspaceProps) {
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-sage">
          Adicione a foto do artista Nº 1 e exporte a edição em uma imagem só.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/u"
            className="inline-flex items-center gap-2 border border-paper/20 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition-colors hover:border-paper/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Meu chart
          </Link>
          <ExportChartButton edition={edition} photo={photo} onPhotoChange={setPhoto} />
        </div>
      </div>

      <WeeklyChart
        edition={edition}
        photo={photo}
        onPhotoChange={setPhoto}
        className="border border-paper/10 shadow-[0_24px_80px_-40px_rgba(0,229,143,0.35)]"
      />
    </div>
  );
}
