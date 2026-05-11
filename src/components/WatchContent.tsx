"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, SkipForward, Monitor, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { addXPAction, logPlaybackProgressAction, completeAnimeAction } from "@/app/actions";
import { AnimeComments } from "./AnimeComments";
import { ReportAnime } from "./ReportAnime";

type Anime = Record<string, unknown>;
type Season = Record<string, unknown>;

interface WatchContentProps {
  anime: Anime;
  initialEpisode: number;
  seasons?: Season[];
}

export function WatchContent({ anime, initialEpisode, seasons = [] }: WatchContentProps) {
  const router = useRouter();
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentServer, setCurrentServer] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoSkip, setAutoSkip] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [isDub, setIsDub] = useState(false);
  const [lastLoggedTime, setLastLoggedTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null);
  const [epPage, setEpPage] = useState(Math.floor((initialEpisode - 1) / 50));
  const epsPerPage = 50;

  const totalEpisodes = anime.episodes || (anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : 0);
  const dubEpisodes = Math.floor(totalEpisodes * 0.7);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentEpisode(initialEpisode);
      setEpPage(Math.floor((initialEpisode - 1) / 50));
      // Auto-switch to SUB if initial episode isn't dubbed
      if (isDub && initialEpisode > dubEpisodes) {
        setIsDub(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialEpisode, isDub, dubEpisodes]);

  const title = anime.title.english || anime.title.romaji;
  
  const totalEpPages = Math.ceil(totalEpisodes / epsPerPage);
  
  const isCurrentEpisodeDubbed = currentEpisode <= dubEpisodes;

  const handleEpisodeChange = useCallback((ep: number) => {
    // If we're in DUB mode but the new episode isn't dubbed, switch to SUB
    if (isDub && ep > dubEpisodes) {
      setIsDub(false);
    }
    setCurrentEpisode(ep);
    router.push(`/watch/${anime.id}?ep=${ep}`, { scroll: false });
  }, [isDub, dubEpisodes, anime.id, router]);

  // Player Events Effect
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Security: Origin check
      if (!event.origin.includes("megaplay.buzz")) return;

      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      // Player ready - seek to saved time if pending
      if (data.event === "time" && !playerReady) {
        setPlayerReady(true);
        if (pendingSeekTime !== null) {
          const iframe = document.querySelector('iframe');
          iframe?.contentWindow?.postMessage(JSON.stringify({ event: "seek", time: pendingSeekTime }), "*");
          setPendingSeekTime(null);
        }
      }

      if (data.event === "complete") {
        if (autoplay && currentEpisode < totalEpisodes) {
          handleEpisodeChange(currentEpisode + 1);
        } else if (currentEpisode === totalEpisodes) {
          // Auto-complete when last episode finishes
          await completeAnimeAction(anime.id, totalEpisodes);
        }
      }

      if (data.type === "watching-log") {
        const currentTime = Math.floor(data.currentTime);
        const now = Date.now();

        // Skip logging if time is 0 (initial load) or too soon since last log
        if (currentTime === 0 || now - lastLoggedTime <= 5000) return;

        setLastLoggedTime(now);

        if (currentTime > 0 && currentTime % 60 === 0) {
          await addXPAction(1);
        }

        await logPlaybackProgressAction(anime.id, {
          progress: currentEpisode,
          watchedTime: currentTime
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoplay, currentEpisode, totalEpisodes, handleEpisodeChange, lastLoggedTime, anime.id, playerReady, pendingSeekTime]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-12 transition-all duration-300 relative">
      {/* Focus Mode Overlay */}
      {focusMode && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] transition-opacity duration-500 cursor-pointer" 
          onClick={() => setFocusMode(false)}
        />
      )}

      <div className="flex flex-col gap-5 relative">
        
        {/* Top Header */}
        <div className="flex justify-between items-center text-[#9ca3af] font-mono text-xs font-medium tracking-tight px-1">
          <Link 
            href={`/anime/${anime.id}`} 
            className="flex items-center gap-1.5 hover:text-[#e2a84b] transition-colors group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="truncate max-w-[300px] md:max-w-md">{title}</span>
          </Link>
          <div className="bg-white/5 px-2.5 py-1 rounded border border-white/5">
            Ep {currentEpisode} / {totalEpisodes || "?"}{isDub ? " (DUB)" : " (SUB)"}
          </div>
        </div>

        {/* Player Area */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Side: Player + Controls */}
          <div className={cn("flex-1 flex flex-col gap-4 relative", focusMode ? "z-[110]" : "z-10")}>
            {/* Main Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <iframe
                key={iframeKey}
                onLoad={() => {
                  setPlayerReady(false);
                  const params = new URLSearchParams(window.location.search);
                  const time = params.get('time');
                  if (time && parseInt(time) > 0) {
                    setPendingSeekTime(parseInt(time));
                  }
                }}
                src={`https://megaplay.buzz/stream/ani/${anime.id}/${currentEpisode}/${isDub ? "dub" : "sub"}`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                scrolling="no"
              />
            </div>

            {/* Server & Secondary Controls Bar */}
            <div className="bg-[#121212] border border-white/5 rounded-lg p-3.5 flex flex-wrap justify-between items-center gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-[#4b5563] font-mono text-[10px] font-bold uppercase tracking-widest">Server</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentServer(1)}
                    className={cn(
                      "px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                      currentServer === 1 ? "bg-[#e2a84b]/10 border border-[#e2a84b]/30 text-[#e2a84b]" : "bg-white/5 border border-white/5 text-[#9ca3af] hover:bg-white/10"
                    )}
                  >
                    Server 1
                  </button>
                  <button 
                    onClick={() => setCurrentServer(2)}
                    className={cn(
                      "px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                      currentServer === 2 ? "bg-[#e2a84b]/10 border border-[#e2a84b]/30 text-[#e2a84b]" : "bg-white/5 border border-white/5 text-[#9ca3af] hover:bg-white/10"
                    )}
                  >
                    Server 2
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-white/5">
                   <button 
                     onClick={() => setAutoplay(!autoplay)}
                     className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                        autoplay ? "bg-[#e2a84b]/10 border border-[#e2a84b]/30 text-[#e2a84b]" : "bg-white/5 border border-white/5 text-[#4b5563]"
                     )}
                   >
                     <div className={cn("w-1.5 h-1.5 rounded-full", autoplay ? "bg-[#e2a84b]" : "bg-[#4b5563]")} />
                     Autoplay
                   </button>
                   <button 
                     onClick={() => setAutoSkip(!autoSkip)}
                     className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                        autoSkip ? "bg-[#e2a84b]/10 border border-[#e2a84b]/30 text-[#e2a84b]" : "bg-white/5 border border-white/5 text-[#4b5563]"
                     )}
                   >
                     <div className={cn("w-1.5 h-1.5 rounded-full", autoSkip ? "bg-[#e2a84b]" : "bg-[#4b5563]")} />
                     Auto-Skip
                   </button>
                   
                   {/* SUB/DUB Toggle */}
                   <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-0.5">
                      <button 
                        onClick={() => setIsDub(false)}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] font-black uppercase transition-all",
                          !isDub ? "bg-[#e2a84b] text-black" : "text-[#4b5563] hover:text-[#9ca3af]"
                        )}
                      >
                        SUB
                      </button>
                      <button 
                        disabled={!isCurrentEpisodeDubbed}
                        onClick={() => setIsDub(true)}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] font-black uppercase transition-all",
                          isDub ? "bg-[#e2a84b] text-black" : "text-[#4b5563]",
                          isCurrentEpisodeDubbed ? "hover:text-[#9ca3af]" : "opacity-20 cursor-not-allowed"
                        )}
                      >
                        DUB
                      </button>
                   </div>

                   <button 
                     onClick={() => setFocusMode(!focusMode)}
                     className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all",
                        focusMode ? "bg-[#e2a84b] border-[#e2a84b] text-[#161313]" : "bg-white/5 border border-white/5 text-[#4b5563]"
                     )}
                   >
                     <Monitor className="w-3 h-3" />
                     Focus
                   </button>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setIframeKey(prev => prev + 1)}
                     className="p-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
                   >
                     <RotateCcw className="w-4 h-4 text-[#9ca3af]" />
                   </button>
                   <ReportAnime animeId={anime.id} />
                   <button 
                     disabled={currentEpisode <= 1}
                                        onClick={() => handleEpisodeChange(currentEpisode - 1)}
                     className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-[#9ca3af] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronLeft className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Prev</span>
                   </button>
                   <button 
                     disabled={currentEpisode >= totalEpisodes || (isDub && currentEpisode >= dubEpisodes)}
                     onClick={() => handleEpisodeChange(currentEpisode + 1)}
                     className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <span className="text-xs font-bold uppercase tracking-wider">Next</span>
                     <SkipForward className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Anime Info & Seasons Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
            {/* Anime Info Header */}
            <div className="bg-[#121212] border border-white/5 rounded-lg p-3 flex gap-4 shadow-xl group hover:border-white/10 transition-all">
              <div className="relative w-20 h-28 flex-shrink-0 rounded-md overflow-hidden border border-white/5">
                <Image 
                  src={anime.coverImage.large} 
                  alt={title} 
                  fill 
                  sizes="80px"
                  className="object-cover"
                />
              </div>              <div className="flex flex-col gap-1.5 py-1">
                  <span className="text-[#4b5563] font-mono text-[9px] font-bold uppercase tracking-[0.2em]">Anime Info</span>
                  <Link href={`/anime/${anime.id}`}>
                  <h3 className="text-white text-[13px] font-bold leading-snug line-clamp-2 hover:text-[#e2a84b] transition-colors">
                    {title}
                  </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {anime.genres.slice(0, 3).map((genre: string) => (
                      <span key={genre} className="text-[#6b7280] text-[10px] font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
              </div>
              <div className="ml-auto flex items-center pr-1">
                  <Link href={`/anime/${anime.id}`}>
                  <ChevronLeft className="w-4 h-4 text-white/20 hover:text-white transition-colors rotate-180" />
                  </Link>
              </div>
            </div>

            {/* Seasons List */}
            <div className="bg-[#121212] border border-white/5 rounded-lg p-5 shadow-xl flex flex-col h-[618px]">
               <h2 className="text-[#4b5563] font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-2 flex-shrink-0">Seasons</h2>
               <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                 {seasons.map((season: Season) => (
                   <Link 
                     key={season.id} 
                     href={`/watch/${season.id}`}
                     className={cn(
                       "flex items-center gap-4 p-3 rounded-lg transition-all group flex-shrink-0",
                       season.id === anime.id ? "bg-[#e2a84b]/5 border border-[#e2a84b]/20" : "bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                     )}
                   >
                     <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden shadow-lg">
                       <Image 
                         src={season.coverImage.large} 
                         alt={season.title.english || season.title.romaji} 
                         fill 
                         sizes="48px"
                         className="object-cover"
                       />
                     </div>
                     <div className="flex flex-col gap-1 min-w-0">
                       <h4 className={cn(
                         "text-[12px] font-bold leading-tight",
                         season.id === anime.id ? "text-[#e2a84b]" : "text-[#f0ece8]/90 group-hover:text-[#e2a84b]"
                       )}>
                         {season.title.english || season.title.romaji}
                       </h4>
                       <span className="text-[10px] text-[#4b5563] font-mono font-bold">{season.seasonYear}</span>
                     </div>
                   </Link>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Episode List Section */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-1 h-3 bg-[#e2a84b] rounded-full" />
              Episodes
            </h2>
            <div className="text-[#4b5563] font-mono text-[10px] font-bold uppercase">
              {totalEpisodes} aired
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {Array.from({ length: Math.min(epsPerPage, totalEpisodes - epPage * epsPerPage) }).map((_, i) => {
              const epNum = epPage * epsPerPage + i + 1;
              const isActive = epNum === currentEpisode;

              return (
                <button
                  key={epNum}
                  onClick={() => handleEpisodeChange(epNum)}
                  className={cn(
                    "h-10 rounded-md flex items-center justify-center text-xs font-bold transition-all border",
                    isActive 
                      ? "bg-[#e2a84b] border-[#e2a84b] text-[#161313] shadow-[0_0_15px_rgba(226,168,75,0.2)]" 
                      : "bg-[#1a1a1a] border-white/5 text-[#6b7280] hover:border-white/10 hover:text-white"
                  )}
                >
                  {epNum}
                </button>
              );
            })}
          </div>

          {totalEpPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={epPage === 0}
                onClick={() => setEpPage(epPage - 1)}
                className="px-3 py-1 bg-[#1a1a1a] border border-white/5 rounded text-xs font-bold text-white/40 hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-[10px] font-mono text-[#4b5563] font-bold">
                PAGE {epPage + 1} / {totalEpPages}
              </span>
              <button
                disabled={epPage >= totalEpPages - 1}
                onClick={() => setEpPage(epPage + 1)}
                className="px-3 py-1 bg-[#1a1a1a] border border-white/5 rounded text-xs font-bold text-white/40 hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div>
           <AnimeComments animeId={anime.id} />
        </div>

      </div>
    </div>
  );
}
