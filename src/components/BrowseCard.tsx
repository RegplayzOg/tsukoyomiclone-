import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Play } from "lucide-react";

interface BrowseCardProps {
  anime: {
    id: number;
    title: {
      english?: string;
      romaji: string;
    };
    coverImage: {
      extraLarge: string;
      large: string;
    };
    averageScore?: number;
    episodes?: number;
    status?: string;
    format?: string;
    genres?: string[];
    nextAiringEpisode?: {
      episode: number;
    };
  };
}

export function BrowseCard({ anime }: BrowseCardProps) {
  const router = useRouter();
  if (!anime || !anime.title) return null;
  const title = anime.title.english && anime.title.english.trim() !== "" ? anime.title.english : anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const subEpisodes = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes || 0;
  const dubEpisodes = Math.floor(subEpisodes * 0.7);

  const isAiring = anime.status === "RELEASING";

  return (
    <div className="group relative block cursor-pointer" onClick={() => router.push(`/anime/${anime.id}`)}>
      {/* Container for card content without its own Link */}
      <div className="block">
        <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#1a1a1a] border border-white/10 transition-all duration-200 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
          {anime.coverImage && (
            <Image
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Top Left: Score */}
          {score && (
            <div className="absolute top-1.5 left-1.5 z-[2] bg-[#1a1206] border border-[#e2a84b] text-[#f0c66a] px-1.5 py-0.5 rounded-[3px] font-mono text-[0.56rem] font-semibold inline-flex items-center gap-[3px]">
              <Star className="w-2.5 h-2.5 fill-[#e2a84b]" />
              {score}
            </div>
          )}

          {/* Top Right: Live Badge */}
          {isAiring && (
            <div className="absolute top-1.5 right-1.5 z-[2] inline-flex items-center gap-1 bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2] px-[7px] py-0.5 rounded-[3px] font-mono text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
              <div className="w-[5px] h-[5px] rounded-full bg-[#4ecb8d] animate-pulse" />
              <span className="uppercase italic">live</span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,12,12,0.96)] via-[rgba(14,12,12,0.18)] to-transparent opacity-0 transition-opacity duration-[220ms] pointer-events-none group-hover:opacity-100" />

          {/* Bottom Left: Episode Badges */}
          <div className="absolute bottom-1.5 left-1.5 flex gap-1 z-[2]">
            {subEpisodes > 0 && (
              <div className="inline-flex items-center gap-[3px] px-[5px] py-0.5 rounded-[3px] font-mono text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)] bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2]">
                S {subEpisodes}
              </div>
            )}
            {dubEpisodes > 0 && (
              <div className="inline-flex items-center gap-[3px] px-[5px] py-0.5 rounded-[3px] font-mono text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)] bg-[#0e1f3a] border border-[#5b9cf0] text-[#bcd6ff]">
                D {dubEpisodes}
              </div>
            )}
          </div>

          {/* Bottom Right: Format Badge */}
          {anime.format && (
            <div className="absolute bottom-1.5 right-1.5 z-[2] px-[5px] py-0.5 bg-black/80 backdrop-blur-sm rounded-[3px] font-mono text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)] text-white/70">
              {anime.format}
            </div>
          )}
        </div>
      </div>

      {/* Watch Now Button (Overlay) - Navigates to /watch */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-[#e2a84b] text-black p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-200 hover:brightness-110 pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/watch/${anime.id}`); }}>
            <Play className="w-6 h-6 fill-black" />
          </div>
      </div>

      {/* Title */}
      <div className="mt-1.5">
          <h3 className="text-white text-[11px] font-semibold line-clamp-2 leading-tight group-hover:text-[#e2a84b] transition-colors mb-1">
            {title}
          </h3>
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 bg-[#1a1a1a] border border-white/10 rounded text-[9px] text-gray-400 font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
