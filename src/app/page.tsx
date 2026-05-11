import { Navbar } from "@/components/Navbar";
import { Spotlight } from "@/components/Spotlight";
import { AnimeGrid } from "@/components/AnimeGrid";
import { Footer } from "@/components/Footer";
import { getTrendingAnime } from "@/lib/anilist";

type Anime = Record<string, unknown>;

const normalizeAnime = (animes: Anime[]) => animes.map((anime: Anime) => ({
  id: anime.id?.toString(),
  title: (anime.title as Record<string, string>)?.english && (anime.title as Record<string, string>).english.trim() !== "" ? (anime.title as Record<string, string>).english : (anime.title as Record<string, string>)?.romaji,
  image: (anime.coverImage as Record<string, string>)?.extraLarge,
  banner: (anime.bannerImage as string) || (anime.coverImage as Record<string, string>)?.extraLarge,
  score: (((anime.averageScore as number) / 10).toFixed(1)),
  year: (anime.seasonYear?.toString()) || "2024",
  episodes: (anime.nextAiringEpisode as Record<string, number>)?.episode
    ? ((anime.nextAiringEpisode as Record<string, number>).episode - 1).toString()
    : ((anime.episodes?.toString()) || "??"),
  studio: (anime.studios as Record<string, unknown>)?.nodes?.[0]?.name || "Unknown",
  genres: anime.genres,
  description: anime.description,
  status: anime.status,
}));

export default async function Home() {
  const [trending, popular, airing, updated, toprated] = await Promise.all([
    getTrendingAnime(6, "TRENDING_DESC", undefined, 180),
    getTrendingAnime(6, "POPULARITY_DESC", undefined, 180),
    getTrendingAnime(6, "POPULARITY_DESC", "NOT_YET_RELEASED", 180),
    getTrendingAnime(6, "UPDATED_AT_DESC", undefined, 180),
    getTrendingAnime(6, "SCORE_DESC", undefined, 180),
  ]);

  return (
    <main className="min-h-screen bg-bg selection:bg-gold/30 selection:text-gold">
      <Navbar />
      
      <Spotlight animes={(trending || []).slice(0, 6)} />

      <div className="hp-body relative z-10 pb-20">
        <div className="mt-16">
          <AnimeGrid
            title="Trending Now"
            animes={normalizeAnime(trending || [])}
            viewAllHref="/browse?sort=trending"
            barColor="gold"
          />

          <AnimeGrid
            title="Most Popular"
            animes={normalizeAnime(popular || [])}
            viewAllHref="/browse?sort=popular"
            barColor="jade"
          />

          <AnimeGrid
            title="Top Rated"
            animes={normalizeAnime(toprated || [])}
            viewAllHref="/browse?sort=toprated"
            barColor="gold"
          />

          <AnimeGrid
            title="Airing Soon"
            animes={normalizeAnime(airing || [])}
            viewAllHref="/browse?sort=airingsoon"
            barColor="purple"
          />

          <AnimeGrid
            title="Recently Updated"
            animes={normalizeAnime(updated || [])}
            viewAllHref="/browse?sort=updated"
            barColor="gray"
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
