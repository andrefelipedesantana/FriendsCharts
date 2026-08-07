import type { RankedAlbum } from "@/lib/chart-edition";
import { formatPlays, initialsOf } from "@/lib/format";
import { ChartImage, ImageFallback } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type FeaturedAlbumProps = {
  album: RankedAlbum | null;
};

export function FeaturedAlbum({ album }: FeaturedAlbumProps) {
  return (
    <section aria-labelledby="chart-featured-album" className="flex flex-col">
      <SectionHeading id="chart-featured-album" title="Álbum da semana" meta="Nº 1" />

      {!album ? (
        <EmptyNote>Nenhum álbum escutado nesta semana</EmptyNote>
      ) : (
        <div className="flex flex-1 gap-3.5 bg-sheet p-3 @poster:gap-4 @poster:p-3">
          <div className="h-[88px] w-[88px] shrink-0 overflow-hidden bg-ink @poster:h-[100px] @poster:w-[100px]">
            <ChartImage
              src={album.image}
              alt={`Capa de ${album.name}`}
              fallback={<ImageFallback label={initialsOf(album.name)} size="lg" />}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="clamp-2 text-[15px] font-black leading-tight text-paper @poster:text-[17px]">
              {album.name}
            </p>
            <p className="truncate font-mono text-[10px] text-sage @poster:text-[11px]">
              {album.artist || "Artista desconhecido"}
            </p>

            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-[15px] font-bold tabular-nums text-signal @poster:text-[17px]">
                {formatPlays(album.playcount)}
                <span className="text-sage">×</span>
              </span>
              {album.topListener ? (
                <span className="truncate font-mono text-[10px] text-sage @poster:text-[11px]">
                  maior ouvinte <span className="text-brass">{album.topListener}</span>
                </span>
              ) : null}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
