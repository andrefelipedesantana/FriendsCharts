import { ChartImage } from "@/components/chart/chart-image";
import { formatPlays, formatRank, initialsOf } from "@/lib/format";
import type { UserEdition } from "@/lib/user-edition";
import {
  StoryEmpty,
  StoryFrame,
  StoryHeading,
  StoryMovement,
  StoryRankList,
  StoryStat,
} from "./story-parts";

const MAX_CARRIED = 3;

/** Story da pessoa dentro do grupo: posição, contribuição e afinidades. */
export function GroupStory({ edition }: { edition: UserEdition }) {
  const { solo, group } = edition;
  const carried = group.carried.slice(0, MAX_CARRIED);

  return (
    <StoryFrame
      title="Minha semana no grupo"
      period={solo.period}
      user={solo.user}
      avatar={solo.avatar}
      stats={
        <span className="flex gap-[22px]">
          <StoryStat value={formatPlays(solo.totals.plays)} label="plays" />
          <StoryStat value={`${group.percentage}%`} label="dos plays do grupo" />
        </span>
      }
    >
      {solo.isEmpty ? (
        <StoryEmpty>Nenhum scrobble nesta semana</StoryEmpty>
      ) : (
        <>
          {/* Posição entre os ouvintes */}
          <section className="flex shrink-0 items-end justify-between gap-[30px] bg-sheet px-[36px] py-[28px]">
            <div>
              <p className="font-mono text-[19px] uppercase tracking-[0.2em] text-brass">
                Ouvinte da semana
              </p>
              <p className="mt-[8px] flex items-baseline gap-[18px]">
                <span className="text-[140px] font-black leading-[0.8] tabular-nums text-paper">
                  {group.listenerRank !== null ? `Nº ${group.listenerRank}` : "—"}
                </span>
                <StoryMovement movement={group.listenerMovement} size="lg" />
              </p>
            </div>
            <div className="pb-[6px] text-right font-mono text-[22px] uppercase tracking-[0.1em] text-sage">
              <p>
                de <span className="font-bold text-paper">{group.rankedListeners}</span> ouvintes
              </p>
              <p className="mt-[4px]">
                <span className="font-bold text-signal">{formatPlays(group.groupPlays)}</span> plays
                no grupo
              </p>
            </div>
          </section>

          {/* Afinidade + exclusivo */}
          <section className="grid shrink-0 grid-cols-2 gap-[20px]">
            <div className="flex min-w-0 flex-col gap-[14px] border-[2px] border-paper/12 p-[26px]">
              <p className="font-mono text-[17px] uppercase tracking-[0.2em] text-brass">
                Gosto mais parecido
              </p>
              {group.affinity ? (
                <>
                  <div className="flex items-center gap-[16px]">
                    <span className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-full bg-ink ring-[3px] ring-brass">
                      <ChartImage
                        src={group.affinity.avatar}
                        alt=""
                        fallback={
                          <span className="font-mono text-[22px] font-bold text-signal/70">
                            {initialsOf(group.affinity.user)}
                          </span>
                        }
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[30px] font-bold leading-tight">
                        @{group.affinity.user}
                      </span>
                      <span className="font-mono text-[24px] font-bold text-signal">
                        {group.affinity.score}%
                      </span>
                    </span>
                  </div>
                  {group.affinity.shared.length > 0 ? (
                    <p className="clamp-2 font-mono text-[18px] leading-snug text-sage">
                      {group.affinity.shared.join(" · ")}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="font-mono text-[20px] text-sage">Ninguém ouviu o mesmo que eu</p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-[14px] border-[2px] border-paper/12 p-[26px]">
              <p className="font-mono text-[17px] uppercase tracking-[0.2em] text-brass">
                Só eu ouvi
              </p>
              {group.exclusive ? (
                <>
                  <p className="clamp-2 text-[40px] font-black uppercase leading-[0.95] tracking-[-0.02em]">
                    {group.exclusive.name}
                  </p>
                  <p className="font-mono text-[22px] text-sage">
                    <span className="font-bold text-signal">
                      {formatPlays(group.exclusive.playcount)}
                    </span>{" "}
                    plays · exclusivo
                  </p>
                </>
              ) : (
                <p className="font-mono text-[20px] text-sage">
                  Tudo que ouvi, alguém do grupo também ouviu
                </p>
              )}
            </div>
          </section>

          {/* Peso no chart do grupo */}
          <section className="shrink-0">
            <StoryHeading
              title="No chart do grupo"
              meta={carried.length > 0 ? "Maior ouvinte de" : undefined}
            />
            <ol className="flex flex-col gap-[10px]">
              {carried.map((artist) => (
                <li key={artist.name} className="flex h-[62px] items-center gap-[20px] bg-sheet px-[20px]">
                  <span className="w-[42px] shrink-0 font-mono text-[24px] font-bold text-signal">
                    {formatRank(artist.groupRank)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[31px] font-bold">{artist.name}</span>
                  <span className="shrink-0 font-mono text-[22px] text-sage">
                    <span className="font-bold text-signal">{formatPlays(artist.userPlays)}</span> de{" "}
                    {formatPlays(artist.groupPlays)} plays
                  </span>
                </li>
              ))}
              {group.groupLeader ? (
                <li className="flex items-center justify-between gap-[20px] px-[4px] pt-[6px] font-mono text-[21px] text-sage">
                  <span className="min-w-0 truncate">
                    Nº 1 do grupo: <span className="font-bold text-paper">{group.groupLeader.name}</span>
                  </span>
                  <span className="shrink-0">
                    contribuí com{" "}
                    <span className="font-bold text-signal">
                      {formatPlays(group.groupLeader.userPlays)}
                    </span>{" "}
                    de {formatPlays(group.groupLeader.groupPlays)}
                  </span>
                </li>
              ) : null}
            </ol>
          </section>

          {/* Top pessoal com a posição de cada um no grupo */}
          <section className="shrink-0">
            <StoryHeading
              title="Meus artistas"
              meta={solo.hasHistory ? "vs. semana passada" : `Top ${solo.artists.length}`}
            />
            <StoryRankList
              items={solo.artists}
              badge={(item) =>
                item.groupRank ? (
                  <span className="shrink-0 border border-brass/60 px-[8px] py-[1px] font-mono text-[16px] font-bold uppercase tracking-[0.1em] text-brass">
                    Nº {item.groupRank} no grupo
                  </span>
                ) : null
              }
            />
          </section>
        </>
      )}
    </StoryFrame>
  );
}
