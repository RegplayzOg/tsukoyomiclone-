import { getAnimeById, getAllSeasons } from "@/lib/anilist";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WatchContent } from "@/components/WatchContent";
import { notFound } from "next/navigation";

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { ep } = await searchParams;
  
  const anime = await getAnimeById(parseInt(id));

  if (!anime) {
    notFound();
  }

  const seasons = await getAllSeasons(parseInt(id));
  const currentEpisode = ep ? parseInt(ep) : 1;

  return (
    <main className="min-h-screen bg-bg selection:bg-gold/30 selection:text-gold">
      <Navbar />
      <div className="pt-20 pb-12">
        <WatchContent anime={anime} initialEpisode={currentEpisode} seasons={seasons} />
      </div>
      <Footer />
    </main>
  );
}
