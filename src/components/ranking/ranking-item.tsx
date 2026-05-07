import Image from "next/image";

type RankingItemProps = {
  position: number;
  name: string;
  plays: number;
  user?: string;
  image?: string;
};

export function RankingItem({
  position,
  name,
  plays,
  user,
  image,
}: RankingItemProps) {
  return (
    <div className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-4 transition-all hover:border-emerald-500 hover:bg-zinc-900">

      <div className="flex items-center gap-4">

        <span className="w-8 text-lg font-bold text-zinc-500">
          {position}
        </span>

        {image && (
          <Image
            src={image}
            alt={name}
            width={56}
            height={56}
            className="rounded-xl object-cover"
          />
        )}

        <div>

          <h3 className="text-lg font-bold text-white">
            {name}
          </h3>

          {user && (
            <p className="text-sm text-zinc-400">
              @{user}
            </p>
          )}

        </div>

      </div>

      <div className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-emerald-400">
        {plays} plays
      </div>

    </div>
  );
}