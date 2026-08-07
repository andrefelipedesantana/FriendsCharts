import React from "react";

import type { ChartHeadliner, RankedTrack } from "@/lib/chart-edition";
import { formatPlays, initialsOf } from "@/lib/format";
import type { RankMovement } from "@/lib/rank-movement";
import { cn } from "@/lib/utils";
import { ChartImage } from "./chart-image";

/** Mensagem contextual da liderança — o texto vem pronto da camada de dados. */
function LeaderStatusChip({
  message,
  kind,
  previousRank,
}: {
  message: string | null;
  kind: RankMovement["kind"];
  previousRank?: number;
}) {
  if (!message) return null;

  const detail =
    kind === "up" && previousRank ? `${message}, vindo do Nº ${previousRank}` : message;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.16em] @poster:text-[10px]",
        kind === "new" ? "bg-paper text-ink" : "border border-signal/45 text-signal"
      )}
      title={detail}
    >
      {kind === "up" ? (
        <svg viewBox="0 0 10 8" aria-hidden className="h-[7px] w-[9px]" fill="currentColor">
          <path d="M5 0 10 8H0z" />
        </svg>
      ) : kind === "same" ? (
        <span aria-hidden>=</span>
      ) : null}
      {message}
      <span className="sr-only">. {detail}</span>
    </span>
  );
}

type MainHighlightProps = {
  headliner: ChartHeadliner;
  /** Música Nº 1 da semana — divide o destaque com o artista. */
  topTrack?: RankedTrack;
  /** Foto enviada pelo usuário (data URL). Tem prioridade sobre a capa. */
  photo?: string | null;
  /** Controles de foto — sobrepostos ao retrato e removidos da exportação. */
  photoSlot?: React.ReactNode;
};

export function MainHighlight({ headliner, topTrack, photo, photoSlot }: MainHighlightProps) {
  const portrait = photo || headliner.fallbackImage;
  const hasLead = headliner.leadOverRunnerUp > 0 && Boolean(headliner.runnerUpName);

  return (
    <section
      aria-labelledby="chart-headliner"
      className="grid gap-4 @poster:grid-cols-[252px_minmax(0,1fr)] @poster:gap-7"
    >
      <figure className="relative aspect-[4/5] w-full overflow-hidden bg-sheet @poster:aspect-auto @poster:h-[300px] @poster:w-[252px]">
        <ChartImage
          src={portrait}
          alt={`Foto de ${headliner.name}`}
          fallback={
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-brand/15 px-4">
              <span className="font-mono text-5xl font-bold text-signal/70">
                {initialsOf(headliner.name)}
              </span>
              <span className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-sage">
                {headliner.name}
              </span>
            </div>
          }
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-ink/25"
        />

        <figcaption className="absolute left-0 top-0 bg-signal px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink @poster:text-[11px]">
          Nº 1 da semana
        </figcaption>

        {photoSlot}
      </figure>

      <div className="flex flex-col gap-4 @poster:justify-between @poster:gap-0">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-signal @poster:text-[11px]">
              Artista que dominou a semana
            </p>
            <LeaderStatusChip
              message={headliner.statusMessage}
              kind={headliner.movement.kind}
              previousRank={headliner.previousRank}
            />
          </div>
          <h3
            id="chart-headliner"
            className="clamp-2 mt-1.5 text-[38px] font-black uppercase leading-[0.86] tracking-[-0.035em] text-paper @poster:mt-2 @poster:text-[58px]"
          >
            {headliner.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-paper/15 pt-3">
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[38px] font-bold leading-none tabular-nums text-signal @poster:text-[44px]">
              {formatPlays(headliner.playcount)}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-sage">plays</span>
          </p>
          <p className="text-[12px] leading-snug text-sage @poster:text-[13px]">
            {hasLead ? (
              <>
                <span className="font-bold text-paper">
                  {formatPlays(headliner.leadOverRunnerUp)}
                </span>{" "}
                à frente de {headliner.runnerUpName}
              </>
            ) : (
              "Único artista no ranking desta edição"
            )}
            {headliner.deposedLeader ? (
              <>
                {" · "}
                <span className="text-paper/80">{headliner.deposedLeader.name}</span>{" "}
                {headliner.deposedLeader.currentRank
                  ? `caiu para o Nº ${headliner.deposedLeader.currentRank}`
                  : "saiu do top 10"}
              </>
            ) : null}
          </p>
        </div>

        <div className="grid gap-3 border-t border-paper/15 pt-3 @chart:grid-cols-2 @poster:gap-5">
          {headliner.topListener ? (
            <div className="flex items-center gap-2.5">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sheet">
                <ChartImage
                  src={headliner.topListenerAvatar}
                  alt=""
                  fallback={
                    <span className="font-mono text-xs font-bold text-signal/70">
                      {initialsOf(headliner.topListener)}
                    </span>
                  }
                />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-sage @poster:text-[10px]">
                  Maior ouvinte
                </span>
                <span className="block truncate text-[15px] font-bold leading-tight text-brass @poster:text-[16px]">
                  {headliner.topListener}
                </span>
                {headliner.topListenerPlays ? (
                  <span className="block font-mono text-[10px] tabular-nums text-sage">
                    {formatPlays(headliner.topListenerPlays)} plays
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}

          {topTrack ? (
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center bg-signal/15 font-mono text-[11px] font-bold text-signal"
              >
                01
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-sage @poster:text-[10px]">
                  Música da semana
                </span>
                <span className="block truncate text-[15px] font-bold leading-tight text-paper @poster:text-[16px]">
                  {topTrack.name}
                </span>
                <span className="block font-mono text-[10px] tabular-nums text-sage">
                  {formatPlays(topTrack.playcount)} plays
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
