import Image from "next/image";

type Artist = {
  name: string;
  playcount: number;
  topListener?: string;
};

type ArtistRankingProps = {
  artists: Artist[];
};

export function ArtistsRanking({
  artists,
}: ArtistRankingProps) {
  const maxPlays = artists.length > 0 ? Math.max(...artists.map((a) => a.playcount)) : 1;

  return (
    <section className="rounded-[28px] bg-[#121212] p-6 pb-8 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-[#00E58F]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <h2 className="text-xl font-bold text-white">
          Top Artistas
        </h2>
      </div>

      <div className="space-y-6">
        {artists.map((artist, index) => {
          const percentage = Math.max((artist.playcount / maxPlays) * 100, 2);
          const position = index + 1;
          return (
            <div key={artist.name} className="flex items-center gap-5">
              <div className="flex w-6 justify-center text-lg">
                {position === 1 ? '🏆' :
                  position === 2 ? '🥈' :
                    position === 3 ? '🥉' :
                      <span className="text-sm font-bold text-zinc-500">{position}</span>}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-zinc-100 md:text-xl">{artist.name}</span>
                  <span className="text-sm font-bold text-[#00E58F] md:text-lg">
                    {artist.playcount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1.5 flex-1 rounded-full bg-zinc-800/50">
                    <div
                      className="h-full rounded-full bg-[#00E58F]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {artist.topListener && (
                    <div className="flex items-center gap-2 rounded-full border border-zinc-800/50 bg-black/40 px-2 py-0.5 md:px-3 md:py-1">
                      <span className="text-[10px] font-semibold text-zinc-300 md:text-sm">{artist.topListener}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}