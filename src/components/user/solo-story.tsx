import { ChartImage } from "@/components/chart/chart-image";
import { formatPlays, initialsOf } from "@/lib/format";
import type { UserSoloEdition } from "@/lib/user-edition";
import {
  StoryEmpty,
  StoryFrame,
  StoryHeading,
  StoryMovement,
  StoryRankList,
  StoryStat,
} from "./story-parts";

type SoloStoryProps = {
  edition: UserSoloEdition;
  /** Foto do artista Nº 1 escolhida pelo usuário (data URL). */
  photo?: string | null;
};

/** Story pessoal: só os dados da pessoa, sem nenhuma referência ao grupo. */
export function SoloStory({ edition, photo }: SoloStoryProps) {
  const { user, avatar, period, totals, topArtist, topAlbum, artists, tracks, hasHistory } = edition;
  const portrait = photo || topArtist?.image;
  const meta = (size: number) => (hasHistory ? `Top ${size} · vs. semana passada` : `Top ${size}`);

  return (
    <StoryFrame
      title="Meu chart da semana"
      period={period}
      user={user}
      avatar={avatar}
      stats={
        <span className="flex gap-[22px]">
          <StoryStat value={formatPlays(totals.plays)} label="plays" />
          <StoryStat value={formatPlays(totals.artists)} label="artistas" />
          <StoryStat value={formatPlays(totals.tracks)} label="músicas" />
        </span>
      }
    >
      {edition.isEmpty || !topArtist ? (
        <StoryEmpty>Nenhum scrobble nesta semana</StoryEmpty>
      ) : (
        <>
          {/* O destaque ocupa o espaço que sobra: a foto é quadrada na altura disponível. */}
          <section className="flex min-h-0 flex-1 gap-[36px]">
            <figure className="relative grid aspect-square h-full shrink-0 place-items-center overflow-hidden bg-sheet">
              <ChartImage
                src={portrait ?? undefined}
                alt={`Foto de ${topArtist.name}`}
                fallback={
                  <span className="font-mono text-[110px] font-bold text-signal/70">
                    {initialsOf(topArtist.name)}
                  </span>
                }
              />
              <span className="absolute left-0 top-0 bg-signal px-[14px] py-[6px] font-mono text-[18px] font-bold uppercase tracking-[0.16em] text-ink">
                Nº 1
              </span>
            </figure>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="flex items-center gap-[14px] font-mono text-[19px] uppercase tracking-[0.2em] text-signal">
                  Artista da semana
                  <StoryMovement movement={topArtist.movement} />
                </p>
                <p className="clamp-2 mt-[10px] text-[56px] font-black uppercase leading-[0.92] tracking-[-0.02em]">
                  {topArtist.name}
                </p>
                <p className="mt-[16px] flex items-baseline gap-[12px]">
                  <span className="text-[84px] font-black leading-none tabular-nums text-signal">
                    {formatPlays(topArtist.playcount)}
                  </span>
                  <span className="font-mono text-[20px] uppercase tracking-[0.18em] text-sage">
                    plays
                  </span>
                </p>
                <p className="mt-[6px] font-mono text-[20px] uppercase tracking-[0.1em] text-sage">
                  {topArtist.percentage}% da minha semana
                </p>
              </div>

              {topAlbum ? (
                <div className="flex items-center gap-[18px] border-t-[2px] border-paper/15 pt-[18px]">
                  <span className="grid h-[112px] w-[112px] shrink-0 place-items-center overflow-hidden bg-sheet ring-[3px] ring-brass">
                    <ChartImage
                      src={topAlbum.image}
                      alt=""
                      fallback={
                        <span className="font-mono text-[30px] font-bold text-signal/70">
                          {initialsOf(topAlbum.name)}
                        </span>
                      }
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[16px] uppercase tracking-[0.2em] text-brass">
                      Álbum da semana
                    </span>
                    <span className="mt-[4px] block truncate text-[28px] font-bold leading-tight">
                      {topAlbum.name}
                    </span>
                    <span className="block truncate font-mono text-[18px] text-sage">
                      {topAlbum.artist} · {formatPlays(topAlbum.playcount)}×
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <section className="shrink-0">
            <StoryHeading title="Artistas" meta={meta(artists.length)} />
            <StoryRankList items={artists} />
          </section>

          <section className="shrink-0">
            <StoryHeading title="Músicas" meta={meta(tracks.length)} />
            <StoryRankList items={tracks} withArtist />
          </section>
        </>
      )}
    </StoryFrame>
  );
}
