"use client";

import { useState } from "react";

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

        <ExportChartButton edition={edition} photo={photo} onPhotoChange={setPhoto} />
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
