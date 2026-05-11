"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Info, Star, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import Link from "next/link";

type Anime = Record<string, unknown>;

interface SpotlightProps {
  animes: Anime[];
}

export function Spotlight({ animes }: SpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const anime = animes[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [animes.length]);

  useEffect(() => {
    const nextEpisode = anime?.nextAiringEpisode;
    if (!nextEpisode?.airingAt) {
      setTimeout(() => setTimeLeft(""), 0);
      return;
    }

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

    setTimeout(() => calculateTimeLeft(), 0);
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [anime]);

  const handleSwipe = (direction: number) => {
    if (direction > 0) {
      setCurrentIndex((prev) => (prev + 1) % animes.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length);
    }
  };

  if (!anime) return null;

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#0e0c0c] select-none"
      style={{ touchAction: 'pan-y' }}
      onMouseDown={(e) => {
        e.preventDefault();
        setTouchStart({ x: e.clientX, y: e.clientY });
      }}
      onMouseUp={(e) => {
        if (!touchStart) return;
        const deltaX = e.clientX - touchStart.x;
        const deltaY = e.clientY - touchStart.y;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            handleSwipe(-1);
          } else {
            handleSwipe(1);
          }
        }
        setTouchStart(null);
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      }}
      onTouchMove={(e) => {
        if (!touchStart) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault();
        }
      }}
      onTouchEnd={(e) => {
        if (!touchStart) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            handleSwipe(-1);
          } else {
            handleSwipe(1);
          }
        }
        setTouchStart(null);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) {
              handleSwipe(1);
            } else if (swipe > 10000) {
              handleSwipe(-1);
            }
          }}
        >
          {/* Background Banner Slides */}
          <div className="absolute inset-0 relative flex-[0_0_100%] h-full">
            <Image
              src={anime.bannerImage || anime.coverImage.extraLarge}
              alt={anime.title.english || anime.title.romaji || "Anime"}
              fill
              sizes="100vw"
              className="w-full h-full object-cover object-center blur-[2px] scale-105 md:object-[center_22%]"
              priority
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,6,13,0.97)_0%,rgba(7,6,13,0.78)_32%,rgba(7,6,13,0.22)_62%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#07060d_0%,rgba(7,6,13,0.72)_18%,transparent_48%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,6,13,0.55)_0%,transparent_14%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,6,13,0.3)_0%,rgba(7,6,13,0.55)_38%,rgba(7,6,13,0.9)_62%,#07060d_100%)] md:hidden" />
            <div className="absolute left-0 top-0 bottom-0 w-[3px] z-[4] bg-[linear-gradient(to_bottom,transparent_0%,#e2a84b_30%,#9d5ef5_70%,transparent_100%)] opacity-60" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-20 w-full max-w-[1440px] mx-auto px-4 pb-9 grid grid-cols-1 items-center gap-0 lg:grid-cols-[1fr_260px] lg:px-20 lg:pb-[68px] lg:gap-10 xl:px-24 xl:pb-[76px] xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-0 animate-[hIn_0.7s_0.04s_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="animate-[contentIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
                {/* Ranking Badge */}
                <div className="flex items-stretch mb-3 w-fit">
                  <div className="bg-[#e2a84b] text-[#07060d] font-[family-name:var(--font-cinzel)] text-[0.9rem] font-extrabold tracking-[0.06em] px-[11px] py-[3px] flex items-center leading-none">
                    #{currentIndex + 1}
                  </div>
                  <div className="bg-[rgba(226,168,75,0.10)] border border-[rgba(226,168,75,0.26)] border-l-0 font-[family-name:var(--font-geist-mono)] text-[0.52rem] font-medium tracking-[0.18em] uppercase text-[#e2a84b] px-[11px] flex items-center">
                    Trending Now
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-[family-name:var(--font-geist-sans)] italic text-[clamp(2.2rem,6vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.01em] uppercase text-[#f0ece8] mb-[14px] line-clamp-2 max-w-4xl !leading-[0.8] !text-[clamp(2.5rem,5vw,7rem)]">
                  {anime.title.english || anime.title.romaji}
                </h1>

                {/* Metadata */}
                <div className="flex items-center gap-0 mb-3 flex-wrap">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.54rem] tracking-[0.08em] px-2 border-r border-[rgba(255,255,255,0.11)] first:pl-0 last:border-r-0 text-[#f0c66a] font-medium">
                    <Star className="w-2.5 h-2.5 fill-[#e2a84b] inline-block mr-1 mb-0.5" />
                    {(anime.averageScore / 10).toFixed(1)}
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.54rem] text-[rgba(240,236,232,0.60)] tracking-[0.08em] px-2 border-r border-[rgba(255,255,255,0.11)] first:pl-0 last:border-r-0">
                    {anime.seasonYear}
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.54rem] text-[rgba(240,236,232,0.60)] tracking-[0.08em] px-2 border-r border-[rgba(255,255,255,0.11)] first:pl-0 last:border-r-0">
                    {timeLeft ? (
                      <span className="text-[#4ecb8d]">
                        EP {anime.nextAiringEpisode.episode} IN {timeLeft}
                      </span>
                    ) : (
                      <>{anime.episodes || "?"} EPS</>
                    )}
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.54rem] text-[rgba(240,236,232,0.60)] tracking-[0.08em] px-2 border-r border-[rgba(255,255,255,0.11)] first:pl-0 last:border-r-0">
                    {anime.studios.nodes[0]?.name}
                  </span>
                  {anime.genres.slice(0, 2).map((genre: string) => (
                    <span key={genre} className="font-[family-name:var(--font-geist-mono)] text-[0.54rem] text-[rgba(240,236,232,0.60)] tracking-[0.08em] px-2 border-r border-[rgba(255,255,255,0.11)] first:pl-0 last:border-r-0">
                      <span className="inline-flex bg-[rgba(78,203,141,0.12)] border border-[rgba(78,203,141,0.35)] text-[#7be0a8] px-2 py-0.5 text-[0.56rem] font-bold">
                        {genre}
                      </span>
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-[0.78rem] font-normal text-[rgba(240,236,232,0.30)] leading-[1.75] mb-4 max-w-[520px] line-clamp-2 !max-w-2xl">
                  {anime.description?.replace(/<[^>]*>?/gm, "")}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-[7px] mb-4 flex-wrap">
                  <Link href={`/watch/${anime.id}`}>
                    <button className="inline-flex items-center gap-[7px] px-5 h-[38px] sm:px-7 sm:h-[46px] font-[family-name:var(--font-geist-sans)] italic text-[0.9rem] sm:text-[1.05rem] font-bold tracking-[0.06em] uppercase bg-[#e2a84b] text-[#07060d] border-none cursor-pointer no-underline relative overflow-hidden transition-[filter] duration-150 hover:brightness-110 [clip-path:polygon(0_0,calc(100%-10px)_0,100%_100%,0_100%)]">
                      <Play className="w-4 h-4 fill-[#07060d] mr-2" />
                      Watch Now
                    </button>
                  </Link>
                  <Link href={`/anime/${anime.id}`}>
                    <button className="inline-flex items-center gap-1.5 px-4 h-[38px] sm:px-[22px] sm:h-[46px] font-[family-name:var(--font-geist-sans)] italic text-[0.88rem] sm:text-base font-semibold tracking-[0.06em] uppercase bg-transparent border border-[rgba(255,255,255,0.11)] text-[rgba(240,236,232,0.60)] cursor-pointer no-underline transition-all duration-150 hover:text-[#f0ece8] hover:border-[rgba(240,236,232,0.30)] hover:bg-[rgba(240,236,232,0.06)] [clip-path:polygon(10px_0,100%_0,calc(100%-10px)_100%,0_100%)]">
                      <Info className="w-4 h-4 mr-1.5" />
                      Details
                    </button>
                  </Link>
                </div>


                {/* Search Bar */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 bg-[rgba(13,11,24,0.9)] border border-[rgba(201,151,42,0.2)] border-b-2 border-b-[#e2a84b] px-[14px] py-[11px] transition-all duration-150 backdrop-blur-[20px] focus-within:border-[rgba(201,151,42,0.4)] focus-within:border-b-[#f0c66a]">
                    <Search className="w-3.5 h-3.5 text-[rgba(240,236,232,0.20)] mr-2" />
                    <input
                      placeholder="Search anime, genres…"
                      className="flex-1 bg-transparent border-none outline-none text-[0.88rem] text-[#f0ece8]"
                    />
                    <button className="font-[family-name:var(--font-geist-mono)] text-[0.55rem] tracking-[0.14em] uppercase text-[#f0c66a] bg-transparent border-none cursor-pointer">
                      Search
                    </button>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center gap-[5px]">
                  {animes.slice(0, 8).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        "h-2 cursor-pointer bg-[rgba(240,236,232,0.12)] rounded transition-all duration-[350ms]",
                        currentIndex === i ? "!w-10 !bg-[#e2a84b]" : "w-[14px]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
