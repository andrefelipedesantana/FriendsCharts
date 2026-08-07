import React from "react";

import type { ChartEdition } from "@/lib/chart-edition";
import { cn } from "@/lib/utils";
import { AlbumGrid } from "./album-grid";
import { ArtistImageUploader } from "./artist-image-uploader";
import { ArtistRanking } from "./artist-ranking";
import { ChartFooter } from "./chart-footer";
import { ChartHeader } from "./chart-header";
import { FeaturedAlbum } from "./featured-album";
import { ListenerRanking } from "./listener-ranking";
import { MainHighlight } from "./main-highlight";
import { TrackRanking } from "./track-ranking";

/** Largura da peça exportada. O layout "poster" é calibrado para ela. */
export const CHART_EXPORT_WIDTH = 1080;

type WeeklyChartProps = {
  edition: ChartEdition;
  photo: string | null;
  /** Quando ausente, a peça é só leitura (sem controles de foto). */
  onPhotoChange?: (photo: string | null) => void;
  className?: string;
};

/**
 * A edição inteira em uma peça só. O layout é dirigido por container queries,
 * então este mesmo componente serve a página, a prévia e o PNG de 1080px —
 * não existe uma segunda versão para exportar.
 */
export function WeeklyChart({ edition, photo, onPhotoChange, className }: WeeklyChartProps) {
  const { period, totals, headliner, artists, tracks, featuredAlbum, albums, listeners } = edition;

  return (
    <div className={cn("@container w-full bg-ink text-paper", className)}>
      <div className="flex flex-col gap-5 p-5 @chart:p-7 @poster:gap-5 @poster:p-9">
        <ChartHeader period={period} totals={totals} />

        {edition.isEmpty ? (
          <div className="border border-dashed border-paper/20 px-6 py-14 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-signal">
              Semana sem scrobbles
            </p>
            <p className="mx-auto mt-3 max-w-[380px] text-[13px] leading-relaxed text-sage">
              Ninguém do grupo registrou plays no período. A edição volta assim que o Last.fm
              receber novos scrobbles.
            </p>
          </div>
        ) : (
          <>
            {headliner ? (
              <MainHighlight
                headliner={headliner}
                topTrack={tracks[0]}
                photo={photo}
                photoSlot={
                  onPhotoChange ? (
                    <ArtistImageUploader
                      artistName={headliner.name}
                      photo={photo}
                      onChange={onPhotoChange}
                    />
                  ) : null
                }
              />
            ) : null}

            <div className="grid gap-5 @poster:grid-cols-[1.05fr_0.95fr] @poster:gap-7">
              <ArtistRanking
                artists={artists}
                hasHistory={edition.hasHistory}
                exited={edition.exitedArtists}
              />
              <TrackRanking tracks={tracks} />
            </div>

            <div className="grid gap-5 @poster:grid-cols-[0.36fr_0.64fr] @poster:gap-7">
              <FeaturedAlbum album={featuredAlbum} />
              <ListenerRanking listeners={listeners} />
            </div>

            <AlbumGrid albums={albums} />
          </>
        )}

        <ChartFooter period={period} />
      </div>
    </div>
  );
}
