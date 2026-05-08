import { getAggregatedAlbums } from "@/lib/aggregators/albums";
import { getAggregatedArtists } from "@/lib/aggregators/artists";
import { getAggregatedTracks } from "@/lib/aggregators/tracks";

import { TrackRanking } from "@/components/ranking/track-ranking";
import { ArtistsRanking } from "@/components/ranking/artist-ranking";
import { AlbumsRanking } from "@/components/ranking/album-ranking";
import { ListenerRanking } from "@/components/ranking/top-listener-card";
import { ExportButton } from "@/components/export-button";
import { ExportView } from "@/components/export-view";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [tracksData, albumsData, artistsData] = await Promise.all([
    getAggregatedTracks(),
    getAggregatedAlbums(),
    getAggregatedArtists(),
  ]);

  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  };
  const formattedToday = today.toLocaleDateString("pt-BR", options);
  const formattedLastWeek = lastWeek.toLocaleDateString("pt-BR", options);
  const dateRangeStr = `${formattedLastWeek} – ${formattedToday}`;

  return (
    <main className="relative min-h-screen bg-zinc-950 px-6 py-8 text-white">
      <div className="relative z-10 mx-auto w-full bg-zinc-950 lg:w-[70%] lg:max-w-[1200px]">
        <section className="mb-6 rounded-[32px] bg-[#168853] p-6 shadow-lg md:p-10">

          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </div>
              <span className="text-sm font-bold tracking-widest text-white/90">
                FRIENDCHARTS
              </span>
            </div>

            <ExportButton />

          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Charts Semanal
          </h1>

          <p className="mt-2 font-medium capitalize text-emerald-100">
            {dateRangeStr}
          </p>

        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ArtistsRanking artists={artistsData.artists} />
            <ListenerRanking listeners={tracksData.users} totalPlays={tracksData.totalPlays} />
          </div>
          <div className="space-y-6">
            <TrackRanking tracks={tracksData.tracks} />
            <AlbumsRanking albums={albumsData.albums} />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <ExportView
          artists={artistsData.artists}
          tracks={tracksData.tracks}
          albums={albumsData.albums}
          dateRange={dateRangeStr}
        />
      </div>
    </main>
  );
}