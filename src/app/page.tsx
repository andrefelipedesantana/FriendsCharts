import { ChartWorkspace } from "@/components/chart/chart-workspace";
import { getChartEdition } from "@/lib/chart-edition";

export const dynamic = "force-dynamic";

export default async function Home() {
  const edition = await getChartEdition();

  return (
    <main className="min-h-screen bg-[#030906] px-3 py-4 text-paper sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1080px]">
        <ChartWorkspace edition={edition} />
      </div>
    </main>
  );
}
