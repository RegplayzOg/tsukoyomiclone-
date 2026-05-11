"use client";

import React from "react";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";

interface AnimeCardProps {
  anime: {
    id: number;
    title: string | { english?: string; romaji: string };
    image?: string;
    coverImage?: {
      extraLarge: string;
      large: string;
    };
    episodes: number | string;
    score: string;
    status: string;
  };
  className?: string;
  customHref?: string;
}

export function AnimeCard({ anime, className, customHref }: AnimeCardProps) {
  const isAiring = anime.status === "RELEASING";
  const title = typeof anime.title === "string"
    ? (anime.title.trim() || "Anime")
    : (anime.title.english?.trim() || anime.title.romaji?.trim() || "Anime");

  const mainHref = customHref || `/anime/${anime.id}`;

  return (
    <div className={cn("w-full cursor-pointer block no-underline relative group", className)}>
      <Link href={mainHref} className="block">
        <div className="relative rounded-[7px] overflow-hidden bg-[#1d1a1a] border border-[rgba(255,255,255,0.06)] transition-all duration-[180ms] aspect-square hover:border-[rgba(255,255,255,0.11)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-[2]">
            <span className="bg-[#1a1206] border border-[#e2a84b] text-[#f0c66a] px-1.5 py-0.5 rounded-[3px] font-[family-name:var(--font-geist-mono)] text-[0.56rem] font-semibold inline-flex items-center gap-[3px]">
              <Star className="w-2.5 h-2.5 fill-[#e2a84b]" />
              {anime.score}
            </span>
          </div>

          {/* Top Right Badges */}
          {isAiring && (
            <div className="absolute top-2 right-2 inline-flex items-center gap-1 bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2] px-[7px] py-0.5 rounded-[3px] font-[family-name:var(--font-geist-mono)] text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
              <div className="w-[5px] h-[5px] rounded-full bg-[#4ecb8d] animate-pulse" />
              <span className="uppercase italic">live</span>
            </div>
          )}

          {/* Poster */}
          <Image
            src={anime.image || anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover block transition-transform duration-[380ms] group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,12,12,0.96)] via-[rgba(14,12,12,0.18)] to-transparent opacity-0 transition-opacity duration-[220ms] pointer-events-none group-hover:opacity-100" />

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 z-[5]">
            <div className="w-12 h-12 rounded-full bg-[#e2a84b] flex items-center justify-center shadow-[0_0_20px_rgba(226,168,75,0.4)] transition-transform hover:scale-110">
              <Play className="w-6 h-6 fill-[#161313] text-[#161313] ml-1" />
            </div>
          </div>

          {/* Bottom Right Badges */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 z-[2]">
            <div className="inline-flex items-center gap-[3px] px-[5px] py-0.5 rounded-[3px] font-[family-name:var(--font-geist-mono)] text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)] bg-[#0f2a1c] border border-[#4ecb8d] text-[#b6f5d2]">
              S {anime.episodes}
            </div>
            <div className="inline-flex items-center gap-[3px] px-[5px] py-0.5 rounded-[3px] font-[family-name:var(--font-geist-mono)] text-[0.56rem] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.45)] bg-[#0e1f3a] border border-[#5b9cf0] text-[#bcd6ff]">
              D {anime.episodes}
            </div>
          </div>
        </div>
      </Link>

      <Link href={mainHref} className="block">
        {/* Info */}
        <div className="mt-[9px] px-[1px] flex flex-col min-h-[62px]">
          <h3 className="text-[0.78rem] font-semibold text-[#f0ece8] leading-[1.45] line-clamp-2 transition-colors duration-150 tracking-[-0.01em] group-hover:text-[#e2a84b]">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 mt-auto flex-wrap pt-[5px]">
            <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] text-[#4ecb8d] uppercase italic font-black text-[0.55rem]">
              ep {anime.episodes}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
