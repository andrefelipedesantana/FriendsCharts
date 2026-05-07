import Image from "next/image";

type Artist = {
  name: string;
  playcount: number;
  topListener?: string;
};

type Track = {
  name: string;
  playcount: number;
  artist?: string;
  topListener?: string;
};

type Album = {
  name: string;
  playcount: number;
  image?: string;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
};

type ExportViewProps = {
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  dateRange: string;
};

export function ExportView({ artists, tracks, albums, dateRange }: ExportViewProps) {
  const maxPlays = artists.length > 0 ? Math.max(...artists.map((a) => a.playcount)) : 1;
  const topTracks = tracks.slice(0, 3);
  const topAlbum = albums[0];

  return (
    <div id="export-container" className="w-[1080px] bg-[#0A0A0A] p-16 text-white" style={{ fontFamily: "sans-serif" }}>

      <div className="mb-12 flex items-center justify-between rounded-[32px] bg-[#168853] p-12 shadow-2xl">
        <div>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            </div>
            <span className="text-xl font-bold tracking-widest text-white/90">
              FRIENDCHARTS
            </span>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-white">
            Charts Semanal
          </h1>
          <p className="mt-4 text-2xl font-medium text-emerald-100 capitalize">
            {dateRange}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        <div className="rounded-[32px] bg-[#121212] p-10 shadow-xl">
          <h2 className="mb-8 text-3xl font-bold text-white">Top Artists</h2>
          <div className="space-y-8">
            {artists.map((artist, index) => {
              const percentage = Math.max((artist.playcount / maxPlays) * 100, 2);
              const position = index + 1;
              return (
                <div key={artist.name} className="flex items-center gap-6">
                  <div className="flex w-8 justify-center text-2xl font-bold text-zinc-500">
                    {position === 1 ? '🏆' : position === 2 ? '🥈' : position === 3 ? '🥉' : position}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-zinc-100">{artist.name}</span>
                      <span className="text-xl font-bold text-[#00E58F]">
                        {artist.playcount.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2.5 flex-1 rounded-full bg-zinc-800/50">
                        <div
                          className="h-full rounded-full bg-[#00E58F]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {artist.topListener && (
                        <div className="flex items-center gap-2 rounded-full border border-zinc-800/50 bg-black/40 px-3 py-1">
                          <span className="text-sm font-bold text-zinc-300">{artist.topListener}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">

          <div className="rounded-[32px] bg-[#121212] p-10 shadow-xl">
            <h2 className="mb-8 text-3xl font-bold text-white">Top Tracks</h2>
            <div className="space-y-6">
              {topTracks.map((track) => (
                <div key={`${track.name}-${track.artist}`} className="flex flex-col justify-center rounded-2xl border border-zinc-800/50 bg-[#1A1A1A] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{track.name}</h3>
                      <p className="mt-1 text-lg font-medium text-[#00E58F]">{track.artist || "Unknown Artist"}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-lg font-bold text-white">
                      {track.playcount}x
                    </div>
                  </div>
                  {track.topListener && (
                    <div className="self-end rounded-full border border-zinc-800/50 bg-black/40 px-3 py-1">
                      <span className="text-sm font-bold text-zinc-300">top ouvinte: {track.topListener}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {topAlbum && (
            <div className="rounded-[32px] bg-[#121212] p-10 shadow-xl">
              <h2 className="mb-8 text-3xl font-bold text-white">Top Album</h2>
              <div className="relative overflow-hidden rounded-[24px]">
                {topAlbum.image ? (
                  <img
                    src={topAlbum.image}
                    alt={topAlbum.name}
                    className="aspect-square w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="aspect-square w-full bg-zinc-800" />
                )}
                {topAlbum.topListener && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-black/80 px-4 py-2 backdrop-blur-md">
                    <span className="text-sm font-bold text-white">{topAlbum.topListener}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-bold leading-tight text-white line-clamp-1">
                  {topAlbum.name}
                </h3>
                <p className="mt-2 text-lg font-medium text-zinc-400 line-clamp-1">
                  {topAlbum.artist || "Unknown Artist"}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
