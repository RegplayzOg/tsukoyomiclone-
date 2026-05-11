"use client";

import React from "react";
import { AnimeCard } from "./AnimeCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Anime = Record<string, unknown>;

interface AnimeGridProps {
  title: string;
  animes: Anime[];
  viewAllHref?: string;
  barColor?: "gold" | "jade" | "purple" | "gray";
}

export function AnimeGrid({ title, animes, viewAllHref, barColor = "gold" }: AnimeGridProps) {
  const barColors = {
    gold: "bg-gradient-to-b from-[#e2a84b] to-transparent",
    jade: "bg-gradient-to-b from-[#4ecb8d] to-transparent",
    purple: "bg-gradient-to-b from-[#9d5ef5] to-transparent",
    gray: "bg-gradient-to-b from-[rgba(240,236,232,0.26)] to-transparent",
  };
  return (
    <section className="px-4 lg:px-20 xl:px-24 relative z-[1] max-w-full mt-10">
      <div className="flex items-stretch justify-between mb-[18px]">
        <div className="flex items-stretch">
          <div className={`w-1 flex-shrink-0 mr-[14px] ${barColors[barColor]}`} />
          <div>
            <h2 className="text-[clamp(1.2rem,2vw,1.7rem)] font-bold tracking-[0.05em] uppercase text-[#f0ece8] leading-none">
              {title}
            </h2>
            <p className="font-[family-name:var(--font-geist-mono)] text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(240,236,232,0.30)] leading-none mt-[3px]">
              What everyone&apos;s watching
            </p>
          </div>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-2 px-4 rounded border border-[rgba(255,255,255,0.06)] font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-bold uppercase text-[rgba(240,236,232,0.26)] transition-all duration-150 h-8 self-center hover:text-[#e2a84b] hover:border-[rgba(226,168,75,0.26)] hover:bg-[rgba(226,168,75,0.10)] group"
          >
            View All
            <ArrowRight className="w-2.5 h-2.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
        {animes.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
}
