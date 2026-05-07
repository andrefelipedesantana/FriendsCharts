import Image from "next/image";
import { getUserInfo } from "@/services/user-info.service";

type Listener = {
  user: string;
  playcount: number;
};

type ListenerRankingProps = {
  listeners: Listener[];
  totalPlays: number;
};

export async function ListenerRanking({
  listeners,
  totalPlays,
}: ListenerRankingProps) {
  const topListeners = listeners.slice(0, 3);

  if (topListeners.length === 0) return null;

  const listenersWithData = await Promise.all(
    topListeners.map(async (listener) => {
      let imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.user}`;
      const userInfo = await getUserInfo(listener.user);
      if (userInfo && userInfo.image) {
        const extralargeImage = userInfo.image.find((img: any) => img.size === "extralarge")?.["#text"];
        const largeImage = userInfo.image.find((img: any) => img.size === "large")?.["#text"];
        const apiImage = extralargeImage || largeImage;
        if (apiImage) {
          imageUrl = apiImage;
        }
      }
      const percentage = totalPlays > 0 ? Math.round((listener.playcount / totalPlays) * 100) : 0;

      return { ...listener, imageUrl, percentage };
    })
  );

  return (
    <section className="rounded-[28px] bg-[#121212] p-6 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-yellow-500">
          🏆
        </div>
        <h2 className="text-xl font-bold text-white">
          Top Ouvintes
        </h2>
      </div>

      <div className="space-y-6">
        {listenersWithData.map((listener, index) => (
          <div key={listener.user} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                  <Image src={listener.imageUrl} alt={listener.user} width={56} height={56} />
                </div>
                {index === 0 && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#168853] text-[10px] font-bold text-white shadow-md">
                    1º
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-[10px] font-bold text-white shadow-md">
                    2º
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-md">
                    3º
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {listener.user}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-zinc-400">
                  {listener.playcount} plays
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-[#00E58F]">
                {listener.percentage}%
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-widest text-zinc-500">
                DO TOTAL
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}