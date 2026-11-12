import type { Metadata } from "next";
import Link from "next/link";

import { ChartImage } from "@/components/chart/chart-image";
import { users } from "@/constants";
import { resolveAvatars } from "@/lib/chart-edition";
import { initialsOf } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Meu chart · FriendCharts" };

export default async function UserPickerPage() {
  const avatars = await resolveAvatars([...users]);
  const sorted = [...users].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

  return (
    <main className="min-h-screen bg-[#030906] px-4 py-6 text-paper sm:py-10">
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-5">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage hover:text-paper">
          ← Chart do grupo
        </Link>
        <div>
          <h1 className="text-[32px] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Meu chart da semana
          </h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
            Escolha seu usuário do Last.fm para gerar seu story.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {sorted.map((user) => (
            <li key={user}>
              <Link
                href={`/u/${encodeURIComponent(user)}`}
                className="flex items-center gap-3 bg-sheet p-3 transition-colors hover:bg-brand/30 focus-visible:outline-2 focus-visible:outline-signal"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-ink">
                  <ChartImage
                    src={avatars.get(user)}
                    alt=""
                    fallback={
                      <span className="font-mono text-xs font-bold text-signal/70">{initialsOf(user)}</span>
                    }
                  />
                </span>
                <span className="min-w-0 truncate text-[14px] font-bold">{user}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
