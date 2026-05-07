import Image from "next/image";
import { getUserInfo } from "@/services/user-info.service";

type Album = {
  name: string;
  playcount: number;
  image?: string;
  artist?: string;
  topListener?: string;
  topListenerPlays?: number;
};

type AlbumRankingProps = {
  albums: Album[];
};

export async function AlbumsRanking({
  albums,
}: AlbumRankingProps) {
  const topAlbums = albums.slice(0, 4);

  const userInfos = await Promise.all(
    topAlbums.map((album) =>
      album.topListener ? getUserInfo(album.topListener) : null
    )
  );

  return (
    <section className="rounded-[28px] bg-[#121212] p-6 pb-8 shadow-md">
      <h2 className="mb-6 text-xl font-bold text-white">
        Top Albuns Da Semana
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {topAlbums.map((album, index) => {
          const topListener = album.topListener || "unknown";
          let avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${topListener}`;

          const userInfo = userInfos[index];
          if (userInfo && userInfo.image) {
            const extralargeImage = userInfo.image.find((img: any) => img.size === "extralarge")?.["#text"];
            const largeImage = userInfo.image.find((img: any) => img.size === "large")?.["#text"];
            const apiImage = extralargeImage || largeImage;

            if (apiImage) {
              avatarUrl = apiImage;
            }
          }

          const artistName = album.artist || "Unknown Artist";

          return (
            <div key={album.name} className="group relative">
              <div className="relative overflow-hidden rounded-2xl">
                {album.image ? (
                  <Image
                    src={album.image}
                    alt={album.name}
                    width={200}
                    height={200}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-square w-full bg-zinc-800 transition-transform duration-500 group-hover:scale-105" />
                )}

                {album.topListener && (
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md md:right-3 md:top-3 md:gap-2 md:bg-black/70 md:px-2.5 md:py-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 overflow-hidden md:h-7 md:w-7">
                      <Image src={avatarUrl} alt={topListener} width={28} height={28} className="object-cover h-full w-full" />
                    </div>
                    <span className="text-[10px] font-medium text-white md:text-xs md:font-bold">{topListener}</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold leading-tight text-white line-clamp-1">
                  {album.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-zinc-400 line-clamp-1">
                  {artistName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}