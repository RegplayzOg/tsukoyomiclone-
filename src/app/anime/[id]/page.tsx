import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimeDetail } from "@/components/AnimeDetail";
import { getAnimeById, getAllSeasons } from "@/lib/anilist";
import { Suspense } from "react";

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await getAnimeById(parseInt(id));

  if (!anime) {
    return (
      <main className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white">Anime not found</p>
        </div>
        <Footer />
      </main>
    );
  }

  const allSeasons = await getAllSeasons(parseInt(id));

  return (
    <main className="min-h-screen bg-bg selection:bg-gold/30 selection:text-gold">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen" />}>
        <AnimeDetail anime={anime} seasons={allSeasons} />
      </Suspense>
      <Footer />
    </main>
  );
}
