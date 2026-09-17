import type { RankedAlbum } from "@/lib/chart-edition";
import { formatPlays, formatRank, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChartImage, ImageFallback } from "./chart-image";
import { EmptyNote, SectionHeading } from "./section-heading";

type AlbumGridProps = {
  /** Álbum mais escutado — abre a fileira, com destaque maior. */
  featured: RankedAlbum | null;
  albums: RankedAlbum[];
};

/**
 * A fileira de álbuns já começa pelo álbum da semana: ele ocupa a primeira
 * célula, mais larga e marcada, e os demais seguem na mesma linha.
 */
export function AlbumGrid({ featured, albums }: AlbumGridProps) {
  const all = featured ? [featured, ...albums] : albums;

  return (
    <section aria-labelledby="chart-albums" className="flex flex-col">
      <SectionHeading
        id="chart-albums"
        title="Álbuns da semana"
        meta={all.length > 0 ? `Nº ${all[0].rank}–${all[all.length - 1].rank}` : undefined}
      />

      {all.length === 0 ? (
        <EmptyNote>Nenhum álbum escutado nesta semana</EmptyNote>
      ) : (
        <ol
          className={cn(
            "grid grid-cols-2 items-start gap-2.5 @poster:gap-3",
            featured ? "@chart:grid-cols-[1.55fr_1fr_1fr_1fr_1fr]" : "@chart:grid-cols-4"
          )}
        >
          {all.map((album, index) => {
            const isFeatured = Boolean(featured) && index === 0;

            return (
              <li
                key={`${album.rank}-${album.name}`}
                className={cn("min-w-0", isFeatured && "col-span-2 @chart:col-span-1")}
              >
                <div
                  className={cn(
                    "relative aspect-square w-full overflow-hidden bg-sheet",
                    isFeatured && "ring-2 ring-brass"
                  )}
                >
                  <ChartImage
                    src={album.image}
                    alt={`Capa de ${album.name}`}
                    fallback={
                      <ImageFallback label={initialsOf(album.name)} size={isFeatured ? "lg" : "md"} />
                    }
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-0 px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums @poster:text-[10px]",
                      isFeatured ? "bg-brass text-ink" : "bg-ink/85 text-signal"
                    )}
                  >
                    {formatRank(album.rank)}
                  </span>
                  {isFeatured ? (
                    <span className="absolute bottom-0 left-0 right-0 bg-ink/85 px-1.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-brass @poster:text-[10px]">
                      Álbum da semana
                    </span>
                  ) : null}
                </div>

                <p
                  className={cn(
                    "mt-1.5 truncate leading-tight text-paper @poster:mt-2",
                    isFeatured
                      ? "text-[14px] font-black @poster:text-[16px]"
                      : "text-[11px] font-bold @poster:text-[12px]"
                  )}
                >
                  {album.name}
                </p>
                <p
                  className={cn(
                    "truncate font-mono text-sage",
                    isFeatured ? "text-[10px] @poster:text-[11px]" : "text-[9px] @poster:text-[10px]"
                  )}
                >
                  {album.artist || "Artista desconhecido"}
                </p>
                {isFeatured ? (
                  <p className="truncate font-mono text-[12px] font-bold tabular-nums text-signal @poster:text-[14px]">
                    {formatPlays(album.playcount)}
                    <span className="text-sage">×</span>
                  </p>
                ) : null}
                {album.topListener ? (
                  <p
                    className={cn(
                      "truncate font-mono text-sage",
                      isFeatured
                        ? "text-[10px] @poster:text-[11px]"
                        : "text-[9px] @poster:text-[10px]"
                    )}
                  >
                    maior ouvinte <span className="text-brass">{album.topListener}</span>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
