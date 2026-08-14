import type { RankedAlbum } from "@/lib/chart-edition";
import { formatRank, initialsOf } from "@/lib/format";
import { ChartImage, ImageFallback } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type AlbumGridProps = {
  albums: RankedAlbum[];
};

export function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <section aria-labelledby="chart-albums" className="flex flex-col">
      <SectionHeading
        id="chart-albums"
        title="Mais álbuns da semana"
        meta={albums.length > 0 ? `Nº ${albums[0].rank}–${albums[albums.length - 1].rank}` : undefined}
      />

      {albums.length === 0 ? (
        <EmptyNote>Sem outros álbuns nesta semana</EmptyNote>
      ) : (
        <ol className="grid grid-cols-2 gap-2.5 @chart:grid-cols-4 @poster:gap-3">
          {albums.map((album) => (
            <li key={`${album.rank}-${album.name}`} className="min-w-0">
              <div className="relative aspect-square w-full overflow-hidden bg-sheet">
                <ChartImage
                  src={album.image}
                  alt={`Capa de ${album.name}`}
                  fallback={<ImageFallback label={initialsOf(album.name)} size="md" />}
                />
                <span className="absolute left-0 top-0 bg-ink/85 px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums text-signal @poster:text-[10px]">
                  {formatRank(album.rank)}
                </span>
              </div>

              <p className="mt-1.5 truncate text-[11px] font-bold leading-tight text-paper @poster:mt-2 @poster:text-[12px]">
                {album.name}
              </p>
              <p className="truncate font-mono text-[9px] text-sage @poster:text-[10px]">
                {album.artist || "Artista desconhecido"}
              </p>
              {album.topListener ? (
                <p className="truncate font-mono text-[9px] text-sage @poster:text-[10px]">
                  maior ouvinte <span className="text-brass">{album.topListener}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
