"use client";

import React from "react";
import Image from "next/image";
import { Play, Info, Star } from "lucide-react";
import { Anime } from "@/lib/mock";
import { motion } from "framer-motion";

import Link from "next/link";

interface HeroProps {
  anime: Anime;
}

export function Hero({ anime }: HeroProps) {
  return (
    <div className="relative w-full h-[65vh] lg:h-[80vh] overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0">
        <Image
          src={anime.banner}
          alt={anime.title}
          fill
          sizes="100vw"
          className="object-cover scale-[1.02]"
          priority
        />
        {/* Deep, cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
        <div className="absolute inset-0 bg-bg/10" />
      </div>

      {/* Content */}
      <div className="relative h-full max-container px-6 lg:px-10 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Trending Badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-gold/10 text-gold text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-[0.2em] border border-gold/20 shadow-xl backdrop-blur-md">
              Trending #1
            </span>
          </div>

          <h1 className="text-[40px] lg:text-[56px] font-black text-hi mb-4 leading-[1.1] tracking-tight drop-shadow-2xl">
            {anime.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-5 mb-8 text-[13px] font-bold text-hi/60">
            <div className="flex items-center gap-1.5 text-gold">
              <Star className="w-4 h-4 fill-gold" />
              <span>{anime.score}</span>
            </div>
            <span className="w-1 h-1 bg-hi/20 rounded-full" />
            <span className="uppercase tracking-widest">{anime.year}</span>
            <span className="w-1 h-1 bg-hi/20 rounded-full" />
            <span className="uppercase tracking-widest">{anime.episodes} Episodes</span>
            <span className="w-1 h-1 bg-hi/20 rounded-full" />
            <span className="text-gold/90 uppercase tracking-[0.1em]">{anime.studio}</span>
          </div>

          {/* Synopsis */}
          <p className="text-hi/50 text-[15px] lg:text-[17px] mb-10 line-clamp-3 leading-relaxed max-w-2xl font-medium">
            {anime.synopsis}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <Link href={`/anime/${anime.id}`}>
              <button className="flex items-center gap-2.5 bg-gold hover:bg-gold/90 text-bg font-black px-9 py-3.5 rounded-lg transition-all shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs">
                <Play className="w-4 h-4 fill-bg" />
                Watch Now
              </button>
            </Link>
            <Link href={`/anime/${anime.id}`}>
              <button className="flex items-center gap-2.5 bg-bg-secondary/60 hover:bg-bg-secondary/90 text-hi font-bold px-9 py-3.5 rounded-lg border border-white/5 transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs">
                <Info className="w-4 h-4" />
                Details
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

