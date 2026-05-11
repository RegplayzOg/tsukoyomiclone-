"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Share2, List, Play, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { updateWatchlistAction, getUserAnimeStatusAction, removeFromWatchlistAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReportAnime } from "./ReportAnime";

type Anime = Record<string, unknown>;
type Season = Record<string, unknown>;

interface AnimeDetailProps {
  anime: Anime;
  seasons?: Season[];
}

export function AnimeDetail({ anime, seasons = [] }: AnimeDetailProps) {
  const [showFullStory, setShowFullStory] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getUserAnimeStatusAction(anime.id);
      setCurrentStatus(status?.status || null);
    };
    fetchStatus();
  }, [anime.id]);

  const handleUpdateStatus = async (status: string | null) => {
    setAdding(true);
    setShowOptions(false);

    if (status === null) {
      const result = await removeFromWatchlistAction(anime.id);
      if (result.success) setCurrentStatus(null);
    } else {
      const result = await updateWatchlistAction(anime.id, {
        status,
        progress: 0,
        score: 0
      });
      if (result.success) setCurrentStatus(status);
    }

    router.refresh();
    setAdding(false);
  };

  const statuses = [
    { label: "Watching", value: "CURRENT" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Plan to Watch", value: "PLANNING" },
    { label: "On Hold", value: "PAUSED" },
    { label: "Dropped", value: "DROPPED" },
  ];


  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
  const isAiring = anime.status === "RELEASING";

  const nextEpisode = anime.nextAiringEpisode;
  const subEpisodes = nextEpisode?.episode
    ? nextEpisode.episode - 1
    : anime.episodes || 0;
  const dubEpisodes = Math.floor(subEpisodes * 0.7);

  useEffect(() => {
    if (!nextEpisode?.airingAt) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = nextEpisode.airingAt - now;

      if (diff <= 0) {
        setTimeLeft("Recently Aired");
        return;
      }

      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`);

      setTimeLeft(parts.join(" "));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [nextEpisode]);

  // ... rest of component logic ...

  const related = anime.recommendations?.nodes
    ?.slice(0, 2)
    .map((rec: Record<string, unknown>) => rec.mediaRecommendation)
    .filter(Boolean) || [];

  // Clean description
  const cleanDescription = anime.description
    ?.replace(/<br>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n\n+/g, "\n\n") || "";

  const truncatedDescription = cleanDescription.split("\n\n")[0];

  return (
    <div className="min-h-screen pt-14">
      {/* Hero Section */}
      <div className="relative min-h-[420px]">
        {/* Background Banner */}
        {anime.bannerImage && (
          <div className="absolute inset-0 h-[420px]">
            <Image
              src={anime.bannerImage}
              alt={title}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e0c0c]/60 to-[#0e0c0c]" />
          </div>
        )}

        {/* Content */}
        <div className="relative max-w-[1600px] mx-auto px-12 pt-8">
          <div className="flex gap-6">
            {/* Poster */}
            <div className="relative w-[220px] h-[320px] flex-shrink-0 rounded overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src={anime.coverImage.extraLarge || anime.coverImage.large} 
                alt={title} 
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover" 
              />
              {/* Score Badge */}
              <div className="absolute top-2 left-2 bg-[#1a1206] border border-[#e2a84b] text-[#f0c66a] px-2 py-1 rounded-[3px] font-mono text-xs font-semibold inline-flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-[#e2a84b]" />
                {score}
              </div>

              {/* Live Badge */}
              {isAiring && (
                <div className="absolute top-2 right-2 inline-flex items-center gap-1 bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2] px-2 py-1 rounded-[3px] font-mono text-xs font-semibold shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ecb8d] animate-pulse" />
                  <span className="uppercase italic text-[10px]">live</span>
                </div>
              )}

              {/* Episode Badges */}
              <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                {subEpisodes > 0 && (
                  <div className="bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2] px-2 py-1 rounded-[3px] font-mono text-xs font-bold shadow-lg flex items-center justify-between min-w-[50px]">
                    <span className="text-[10px]">SUB</span>
                    <span className="ml-2">{subEpisodes}</span>
                  </div>
                )}
                {dubEpisodes > 0 && (
                  <div className="bg-[#0e1f3a] border border-[#5b9cf0] text-[#bcd6ff] px-2 py-1 rounded-[3px] font-mono text-xs font-bold shadow-lg flex items-center justify-between min-w-[50px]">
                    <span className="text-[10px]">DUB</span>
                    <span className="ml-2">{dubEpisodes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 pt-4">
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                {title}
              </h1>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(parseFloat(score))
                        ? "fill-[#e2a84b] text-[#e2a84b]"
                        : "fill-gray-700 text-gray-700"
                    }`}
                  />
                ))}
                <span className="ml-2 text-white font-bold text-sm">{score}</span>
              </div>

              {/* Genre Tags */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {anime.genres.slice(0, 4).map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-transparent border border-white/20 rounded text-xs text-gray-400 font-medium uppercase tracking-wider"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Episode Info */}
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className="text-[#4ecb8d] font-mono font-semibold">
                  {isAiring && nextEpisode ? (
                    <>● Ep {nextEpisode.episode} in {timeLeft || "..."}</>
                  ) : (
                    <>● {anime.episodes || "?"} Episodes ({anime.status === "FINISHED" ? "Finished" : anime.status})</>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link href={`/watch/${anime.id}`}>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-[#e2a84b] hover:brightness-110 text-black font-bold rounded text-sm transition-all uppercase tracking-wide">
                    <Play className="w-4 h-4 fill-black" />
                    WATCH NOW
                  </button>
                </Link>
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    disabled={adding}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 border font-semibold rounded text-xs transition-all uppercase tracking-wide",
                      currentStatus 
                        ? "bg-[#e2a84b]/10 border-[#e2a84b]/30 text-[#e2a84b]" 
                        : "bg-transparent hover:bg-white/5 border-white/20 text-white"
                    )}
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <List className="w-4 h-4" />}
                    {currentStatus ? statuses.find(s => s.value === currentStatus)?.label.toUpperCase() : "ADD TO LIST"}
                  </button>
                  
                  {showOptions && (
                    <div className="absolute top-full mt-2 left-0 w-48 bg-[#121212] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                      {statuses.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleUpdateStatus(s.value)}
                          className={cn(
                            "w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                            currentStatus === s.value ? "text-[#e2a84b] bg-[#e2a84b]/10" : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                      {currentStatus && (
                        <button
                          onClick={() => handleUpdateStatus(null)}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 border-t border-white/5"
                        >
                          Remove from List
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleCopyLink}
                  className={cn(
                    "flex items-center gap-2 p-2.5 bg-transparent border rounded transition-all",
                    copied 
                      ? "border-[#e2a84b]/30 text-[#e2a84b] hover:bg-[#e2a84b]/10" 
                      : "border-white/20 text-white hover:bg-white/5"
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  {copied && <span className="text-[10px] font-black uppercase">Copied!</span>}
                </button>
                <ReportAnime animeId={anime.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-16 py-12">
        <div className="flex gap-8">
          {/* Left Column - Story & Seasons */}
          <div className="flex-1">
            {/* Story */}
            <div className="mb-12">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                STORY
              </h2>
              <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded p-6">
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {showFullStory ? cleanDescription : truncatedDescription}
                </p>
                {cleanDescription.length > truncatedDescription.length && (
                  <button
                    onClick={() => setShowFullStory(!showFullStory)}
                    className="text-[#e2a84b] text-xs font-semibold mt-3 hover:text-[#f0c66a] transition-colors"
                  >
                    {showFullStory ? "Show less" : "Read more"}
                  </button>
                )}
                {anime.description?.includes("Source:") && (
                  <p className="text-gray-600 text-xs mt-3 italic">
                    (Source: {anime.description.match(/Source: ([^)]+)/)?.[1]})
                  </p>
                )}
              </div>
            </div>

            {/* Seasons */}
            {seasons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                    SEASONS
                  </h2>
                </div>
                <div className="space-y-3">
                  {seasons.map((season: Season) => (
                    <Link
                      key={season.id}
                      href={`/anime/${season.id}`}
                      className="flex items-center gap-4 p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded hover:border-white/20 transition-colors group"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={season.coverImage.large}
                          alt={season.title.english || season.title.romaji}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-sm font-semibold group-hover:text-[#e2a84b] transition-colors">
                          {season.title.english || season.title.romaji}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info & Related */}
          <div className="w-80">
            {/* Info */}
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded p-6 mb-8">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                INFO
              </h2>
              <div className="space-y-3 text-sm">
                <InfoRow label="Format" value={anime.format || "N/A"} />
                <InfoRow label="Status" value={isAiring ? "Airing" : anime.status || "N/A"} />
                <InfoRow
                  label="Season"
                  value={anime.season && anime.seasonYear
                    ? `${anime.season} ${anime.seasonYear}`
                    : "N/A"
                  }
                />
                <InfoRow label="Episodes" value={`${anime.episodes || "?"} / ${anime.episodes || "?"}`} />
                <InfoRow
                  label="Studio"
                  value={anime.studios?.nodes?.[0]?.name || "N/A"}
                />
                <InfoRow label="Year" value={anime.seasonYear || "N/A"} />
                <InfoRow label="Score" value={`${score} / 10`} />
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  RELATED
                </h2>
                <div className="space-y-3">
                  {related.map((rel: Anime) => (
                    <Link
                      key={rel.id}
                      href={`/anime/${rel.id}`}
                      className="flex items-center gap-4 p-4 bg-[#0f0f0f] border border-[#1f1f1f] rounded hover:border-white/20 transition-colors group"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={rel.coverImage.large}
                          alt={rel.title.english || rel.title.romaji}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#e2a84b] transition-colors">
                          {rel.title.english || rel.title.romaji}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
