import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserWorkspace, type StoryMode } from "@/components/user/user-workspace";
import { findParticipant, getUserEdition, UserWeekUnavailableError } from "@/lib/user-edition";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ user: string }>;
  searchParams: Promise<{ modo?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = findParticipant((await params).user);
  return { title: user ? `@${user} · FriendCharts` : "FriendCharts" };
}

export default async function UserChartPage({ params, searchParams }: PageProps) {
  const [{ user: slug }, { modo }] = await Promise.all([params, searchParams]);
  const user = findParticipant(slug);
  if (!user) notFound();

  const initialMode: StoryMode = modo === "grupo" ? "grupo" : "solo";

  let edition;
  try {
    edition = await getUserEdition(user);
  } catch (error) {
    if (!(error instanceof UserWeekUnavailableError)) throw error;

    return (
      <main className="grid min-h-screen place-items-center bg-[#030906] px-4 text-paper">
        <div className="max-w-sm text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            Last.fm indisponível
          </p>
          <p className="mt-3 text-sm text-sage">
            Não foi possível ler a semana de @{user} agora. Tente de novo em alguns minutos.
          </p>
          <Link href="/u" className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-sage hover:text-paper">
            ← Voltar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030906] px-4 py-5 text-paper sm:py-8">
      <div className="mx-auto w-full max-w-[520px]">
        <UserWorkspace edition={edition} initialMode={initialMode} />
      </div>
    </main>
  );
}
