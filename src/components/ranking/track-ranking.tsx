import Image from "next/image";

type Track = {
  name: string;
  playcount: number;
  artist?: string;
  topListener?: string;
};

type TrackRankingProps = {
  tracks: Track[];
};

export function TrackRanking({
  tracks,
}: TrackRankingProps) {
  return (
    <section className="rounded-[28px] bg-[#121212] p-6 pb-8 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-[#00E58F]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        </div>
        <h2 className="text-xl font-bold text-white">
          Top Músicas
        </h2>
      </div>

      <div className="space-y-4">
        {tracks.slice(0, 5).map((track, index) => (
          <div key={`${track.name}-${track.artist}`} className="flex items-center justify-between rounded-2xl border border-zinc-800/50 bg-[#1A1A1A] px-4 py-3.5 transition-colors hover:border-zinc-700">
            <div>
              <h3 className="font-bold text-white md:text-lg">{track.name}</h3>
              <p className="text-xs font-medium text-[#00E58F] md:text-sm">{track.artist || "Unknown Artist"}</p>
            </div>
            <div className="flex items-center gap-4">
              {track.topListener && (
                <div className="flex items-center gap-2 rounded-full border border-zinc-800/50 bg-black/40 px-2 py-0.5 md:px-3 md:py-1">
                  <span className="text-[15px] font-medium text-zinc-300 md:text-sm">{track.topListener}</span>
                </div>
              )}
              <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-sm font-bold text-white md:text-base md:px-4 md:py-2">
                {track.playcount}x
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}