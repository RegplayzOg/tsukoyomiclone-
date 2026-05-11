"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

type WatchlistItem = Record<string, unknown>;

interface WatchlistCardProps {
  item: WatchlistItem;
  onUpdate: (animeId: number, status: string | null) => void;
  statusOptions: { id: string, name: string }[];
}

export function WatchlistCard({ item, onUpdate, statusOptions }: WatchlistCardProps) {
  const router = useRouter();
  const anime = item.anime_data;
  const title = anime.title.english || anime.title.romaji;

  return (
    <div className="relative group flex flex-col h-full">
      {/* Card Body */}
      <div 
        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 cursor-pointer"
        onClick={() => router.push(`/watch/${item.anime_id}?ep=${item.progress || 1}&time=${item.watched_time || 0}`)}
      >
        <Image 
          src={anime.coverImage.extraLarge || anime.coverImage.large} 
          alt={title} 
          fill 
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#e2a84b] text-black p-4 rounded-full shadow-2xl">
            <Play className="w-6 h-6 fill-black" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[0.55rem] font-black uppercase tracking-tighter text-[#e2a84b]">
          {item.status}
        </div>
        {(item.progress > 0 || anime.episodes) && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[0.55rem] font-black uppercase tracking-tighter text-white/60">
            EP {item.progress || 0} {anime.episodes ? `/ ${anime.episodes}` : ""}
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="mt-3 bg-[#121212] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
        <h3 className="text-white text-[11px] font-bold leading-tight line-clamp-1">
          {title}
        </h3>
        <select 
          value={item.status}
          onChange={(e) => onUpdate(item.anime_id, e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-[0.6rem] font-bold uppercase rounded px-2 py-1.5 outline-none text-white w-full cursor-pointer hover:border-[#e2a84b]/30 transition-colors"
        >
          {statusOptions.slice(1).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <button 
          onClick={() => onUpdate(item.anime_id, null)}
          className="w-full text-[0.6rem] font-bold text-red-400 bg-red-500/5 hover:bg-red-500/10 py-1.5 rounded transition-colors border border-red-500/10 uppercase tracking-widest"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
