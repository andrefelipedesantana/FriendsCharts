import React from "react";

import { ChartImage } from "@/components/chart/chart-image";
import type { ChartPeriod } from "@/lib/chart-edition";
import { formatPlays, formatRank, initialsOf } from "@/lib/format";
import { movementLabel, type RankMovement } from "@/lib/rank-movement";
import type { UserRankedItem } from "@/lib/user-edition";
import { cn } from "@/lib/utils";

/** Formato de story do Instagram — a peça é desenhada exatamente neste tamanho. */
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

type StoryFrameProps = {
  title: React.ReactNode;
  period: ChartPeriod;
  user: string;
  avatar?: string;
  /** Linha de números sob o nome do usuário. */
  stats: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Moldura comum aos dois stories. As margens de cima e de baixo deixam
 * espaço para a barra de progresso e o campo de resposta do Instagram.
 */
export function StoryFrame({ title, period, user, avatar, stats, children }: StoryFrameProps) {
  return (
    <div
      className="flex flex-col overflow-hidden bg-ink text-paper"
      style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-[34px] px-[72px] pb-[150px] pt-[140px]">
        <header className="flex flex-col gap-[22px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-[14px]">
              <span aria-hidden className="grid h-[44px] w-[44px] place-items-center bg-signal text-ink">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[24px] w-[24px]"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </span>
              <span className="font-mono text-[18px] font-bold uppercase tracking-[0.3em]">
                FriendCharts
              </span>
            </span>
            <span className="font-mono text-[20px] font-bold uppercase tracking-[0.14em]">
              {period.label}
            </span>
          </div>

          <div aria-hidden className="h-[4px] w-full bg-signal" />

          <h1 className="text-[60px] font-black uppercase leading-[0.9] tracking-[-0.035em]">
            {title}
          </h1>

          <div className="flex items-center gap-[24px]">
            <span className="grid h-[96px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-full bg-sheet ring-[3px] ring-signal">
              <ChartImage
                src={avatar}
                alt=""
                fallback={
                  <span className="font-mono text-[30px] font-bold text-signal/70">
                    {initialsOf(user)}
                  </span>
                }
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[44px] font-bold leading-tight">@{user}</span>
              <span className="mt-[4px] block font-mono text-[22px] uppercase tracking-[0.1em] text-sage">
                {stats}
              </span>
            </span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export function StoryHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[16px] border-t-[2px] border-paper/15 pb-[12px] pt-[10px]">
      <h2 className="font-mono text-[20px] font-semibold uppercase tracking-[0.24em]">{title}</h2>
      {meta ? (
        <span className="shrink-0 font-mono text-[18px] uppercase tracking-[0.18em] text-sage">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export function StoryStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-bold text-signal">{value}</span> {label}
    </span>
  );
}

/**
 * Seta + número + texto acessível. `unknown` não desenha nada: sem dados da
 * semana anterior, a peça fica sem setas em vez de mostrar tudo como "NOVO".
 */
export function StoryMovement({ movement, size = "md" }: { movement: RankMovement; size?: "md" | "lg" }) {
  if (movement.kind === "unknown") return null;

  const text = size === "lg" ? "text-[30px]" : "text-[20px]";
  const arrow = size === "lg" ? "h-[16px] w-[20px]" : "h-[11px] w-[14px]";

  const content =
    movement.kind === "new" ? (
      <span className={cn("bg-paper px-[8px] py-[2px] font-bold text-ink", text)}>NOVO</span>
    ) : movement.kind === "same" ? (
      <span className={cn("font-bold text-sage", text)}>=</span>
    ) : (
      <span
        className={cn(
          "inline-flex items-center gap-[6px] font-bold tabular-nums",
          text,
          movement.kind === "up" ? "text-signal" : "text-coral"
        )}
      >
        <svg viewBox="0 0 10 8" aria-hidden className={arrow} fill="currentColor">
          {movement.kind === "up" ? <path d="M5 0 10 8H0z" /> : <path d="M5 8 0 0h10z" />}
        </svg>
        {movement.positions}
      </span>
    );

  return (
    <span className="inline-flex shrink-0 items-center font-mono uppercase" title={movementLabel(movement)}>
      {content}
      <span className="sr-only">{movementLabel(movement)}</span>
    </span>
  );
}

type StoryRankListProps = {
  items: UserRankedItem[];
  /** Mostra o artista sob o nome (músicas). */
  withArtist?: boolean;
  /** Selo à direita do nome, ex.: posição no grupo. */
  badge?: (item: UserRankedItem) => React.ReactNode;
};

export function StoryRankList({ items, withArtist, badge }: StoryRankListProps) {
  return (
    <ol className="flex flex-col gap-[8px]">
      {items.map((item) => (
        <li
          key={`${item.name}-${item.artist ?? ""}`}
          className={cn(
            "relative flex items-center gap-[20px] overflow-hidden px-[20px]",
            withArtist ? "h-[70px]" : "h-[56px]",
            item.rank === 1 ? "bg-brand/40" : "bg-sheet"
          )}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-brand/25"
            style={{ width: `${Math.max(item.share * 100, 4)}%` }}
          />
          <span className="relative w-[42px] shrink-0 font-mono text-[24px] font-bold text-signal">
            {formatRank(item.rank)}
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="flex items-center gap-[14px]">
              <span className="min-w-0 truncate text-[31px] font-bold leading-tight">{item.name}</span>
              {badge?.(item)}
            </span>
            {withArtist && item.artist ? (
              <span className="block truncate font-mono text-[19px] uppercase tracking-[0.06em] text-sage">
                {item.artist}
              </span>
            ) : null}
          </span>
          <span className="relative shrink-0 font-mono text-[27px] font-bold tabular-nums text-signal">
            {formatPlays(item.playcount)}
            <span className="text-[20px] text-sage">×</span>
          </span>
          <span className="relative flex w-[66px] shrink-0 justify-end">
            <StoryMovement movement={item.movement} />
          </span>
        </li>
      ))}
    </ol>
  );
}

export function StoryEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 place-items-center border-[2px] border-dashed border-paper/20 px-[60px] text-center">
      <p className="font-mono text-[26px] uppercase leading-relaxed tracking-[0.18em] text-sage">
        {children}
      </p>
    </div>
  );
}
