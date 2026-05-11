"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimeCard } from "@/components/AnimeCard";

interface AiringEpisode {
  airingAt: number;
  episode: number;
  media: {
    id: number;
    title: {
      romaji: string;
      english: string;
      native: string;
    };
    coverImage: {
      extraLarge: string;
      large: string;
    };
    format: string;
    genres: string[];
    status: string;
    episodes: number;
    averageScore: number;
  };
}

interface RecentlyReleasedAnime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
  };
  latestEpisode: number;
  format: string;
  genres: string[];
  status: string;
  episodes: number;
  averageScore: number;
}

interface ScheduleClientProps {
  initialSchedule: AiringEpisode[];
  initialRecentlyReleased: RecentlyReleasedAnime[];
}

// Helper functions for date manipulation
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const formatDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

const formatShortDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
};

const formatMonthDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
};

export default function ScheduleClient({ initialSchedule, initialRecentlyReleased }: ScheduleClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fetchedSchedule, setFetchedSchedule] = useState<AiringEpisode[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Derived state to avoid sync setState in effect
  const isToday = isSameDay(selectedDate, new Date());
  const schedule = isToday ? initialSchedule : (fetchedSchedule || []);
  const isLoading = !isToday && isFetching;

  // Fixed date range: 2 days before today to 6 days after today
  const dateRange = useMemo(() => {
    const today = new Date();
    const range = [];
    for (let i = -2; i <= 6; i++) {
      range.push(addDays(today, i));
    }
    return range;
  }, []);

  useEffect(() => {
    if (isSameDay(selectedDate, new Date())) {
      return;
    }

    const fetchScheduleForDate = async (date: Date, signal: AbortSignal) => {
      setIsFetching(true);
      const start = Math.floor(startOfDay(date).getTime() / 1000);
      const end = Math.floor(endOfDay(date).getTime() / 1000);

      try {
        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query ($airingAt_greater: Int, $airingAt_lesser: Int) {
                Page(page: 1, perPage: 50) {
                  airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
                    airingAt
                    episode
                    media {
                      id
                      title { romaji english native }
                      coverImage { extraLarge large }
                      format
                      genres
                      status
                      episodes
                      averageScore
                    }
                  }
                }
              }
            `,
            variables: { airingAt_greater: start, airingAt_lesser: end },
          }),
          signal,
        });
        const data = await response.json();
        if (!signal.aborted) {
          setFetchedSchedule(data.data.Page.airingSchedules);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to fetch schedule:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsFetching(false);
        }
      }
    };

    const controller = new AbortController();
    fetchScheduleForDate(selectedDate, controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedDate]);

  const canGoPrev = !isSameDay(selectedDate, dateRange[0]);
  const canGoNext = !isSameDay(selectedDate, dateRange[dateRange.length - 1]);

  const handlePrevDay = () => {
    if (canGoPrev) {
        setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const handleNextDay = () => {
    if (canGoNext) {
        setSelectedDate(addDays(selectedDate, 1));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-2 md:px-8 max-w-[1440px] mx-auto overflow-x-hidden">
      {/* Header section */}
      <div className="text-center mb-10 animate-[hIn_0.6s_ease-out]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(226,168,75,0.1)] border border-[rgba(226,168,75,0.2)] mb-4">
          <Calendar className="w-3 h-3 text-[#e2a84b]" />
          <span className="text-[0.65rem] font-bold text-[#e2a84b] uppercase tracking-widest">This Week&apos;s Lineup</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tighter text-[#f0ece8] mb-2 uppercase">
          AIRING <span className="text-[#e2a84b]">SCHEDULE</span>
        </h1>
        <p className="text-[0.65rem] font-medium text-[rgba(240,236,232,0.4)] uppercase tracking-[0.25em]">
          Explore releases from across the world
        </p>
      </div>

      {/* Date Navigation */}
      <div className="max-w-6xl mx-auto mb-14">
        <div className="flex items-center justify-between mb-8 px-2 md:px-10">
          <button 
            onClick={handlePrevDay}
            disabled={!canGoPrev}
            className={cn(
                "p-2.5 rounded-xl bg-[#141414] border border-white/5 transition-all text-white/50 shadow-lg",
                canGoPrev ? "hover:border-[#e2a84b]/30 hover:text-[#e2a84b]" : "opacity-20 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[0.85rem] font-black text-[#e2a84b] uppercase tracking-[0.3em] mb-1">
                {formatDay(selectedDate)}
            </span>
            <span className="text-[0.6rem] font-bold text-white/30 uppercase tracking-[0.15em]">
                {formatMonthDay(selectedDate)}
            </span>
          </div>
          <button 
            onClick={handleNextDay}
            disabled={!canGoNext}
            className={cn(
                "p-2.5 rounded-xl bg-[#141414] border border-white/5 transition-all text-white/50 shadow-lg",
                canGoNext ? "hover:border-[#e2a84b]/30 hover:text-[#e2a84b]" : "opacity-20 cursor-not-allowed"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-1.5 md:gap-2.5 justify-center px-1 md:px-4">
            {dateRange.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                return (
                    <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                            "flex flex-col items-center flex-1 min-w-0 max-w-[110px] py-3 md:py-4 px-1 rounded-xl md:rounded-2xl border transition-all duration-300",
                            isSelected 
                                ? "bg-[rgba(226,168,75,0.08)] border-[#e2a84b] text-[#e2a84b] shadow-[0_0_20px_rgba(226,168,75,0.1)] z-10 scale-[1.02] md:scale-[1.05]" 
                                : "bg-[#0c0c0c] border-white/5 text-white/30 hover:border-white/20 hover:text-white/60 hover:bg-[#141414]"
                        )}
                    >
                        <span className="text-[0.5rem] md:text-[0.6rem] font-bold uppercase mb-1 md:mb-2 tracking-tighter md:tracking-widest truncate w-full text-center">
                            {formatShortDay(date)}
                        </span>
                        <span className="text-[1rem] md:text-[1.25rem] font-black leading-none">{date.getDate()}</span>
                        {isToday && (
                            <div className="mt-1.5 md:mt-2.5 flex items-center justify-center gap-1">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#e2a84b] animate-pulse shadow-[0_0_8px_#e2a84b]" />
                                <span className="hidden md:inline text-[0.55rem] font-black uppercase tracking-tighter opacity-70">Now</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Schedule List */}
      <div className="max-w-4xl mx-auto mb-24 min-h-[400px]">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-[#e2a84b] rounded-full shadow-[0_0_10px_rgba(226,168,75,0.3)]" />
            <span className="text-[1rem] font-black text-[#f0ece8] uppercase tracking-[0.1em]">{formatDay(selectedDate)} Lineup</span>
          </div>
          <span className="text-[0.65rem] font-black text-[#e2a84b] bg-[#e2a84b]/10 px-3.5 py-1.5 rounded-full border border-[#e2a84b]/20 shadow-sm uppercase tracking-wider">
            {schedule.length} releases
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : schedule.length > 0 ? (
          <div className="space-y-4 px-2">
            {schedule.map((item, idx) => {
              const airDate = new Date(item.airingAt * 1000);
              const title = item.media.title.english || item.media.title.romaji;
              const [timeStr, ampm] = formatTime(airDate).split(' ');
              const isPast = airDate < new Date();
              
              return (
                <Link 
                  key={`${item.media.id}-${idx}`}
                  href={`/watch/${item.media.id}?ep=${item.episode}`}
                  className="group flex items-center bg-[#111111]/60 backdrop-blur-md hover:bg-[#161616] border border-white/5 hover:border-[#e2a84b]/30 rounded-2xl p-6 transition-all duration-300 no-underline shadow-xl hover:shadow-[#e2a84b]/5"
                >
                  <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-white/5 pr-8 mr-8">
                    <span className="text-[1.3rem] font-black text-[#f0ece8] group-hover:text-[#e2a84b] transition-colors leading-none mb-1">{timeStr}</span>
                    <span className="text-[0.7rem] font-bold text-white/30 uppercase tracking-[0.2em]">{ampm}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col min-w-[60px] border-r border-white/5 pr-4 mr-2">
                        <span className="text-[0.5rem] font-bold text-[#e2a84b]/40 uppercase tracking-[0.2em] mb-1">Episode</span>
                        <span className="text-[1.2rem] font-black text-[#e2a84b] leading-none">{item.episode}</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[1.15rem] font-bold text-[#f0ece8] group-hover:text-[#e2a84b] transition-colors line-clamp-1 mb-1.5 tracking-tight">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2.5">
                            <span className="text-[0.6rem] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                                {item.media.format}
                            </span>
                            <span className="text-white/10">•</span>
                            <div className="flex gap-1.5">
                                {item.media.genres.slice(0, 2).map(g => (
                                    <span key={g} className="text-[0.6rem] text-white/40 font-bold uppercase tracking-tighter">#{g}</span>
                                ))}
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end md:self-center">
                      <div className={cn(
                        "flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all duration-300",
                        isPast 
                          ? "bg-white/5 border-white/10 text-white/30" 
                          : "bg-[#e2a84b]/10 border-[#e2a84b]/30 text-[#e2a84b] shadow-[0_0_20px_rgba(226,168,75,0.08)]"
                      )}>
                        <Clock size={16} strokeWidth={2.5} />
                        <span className="text-[0.75rem] font-black uppercase tracking-[0.15em]">
                          {isPast ? "Released" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-28 bg-[#111111]/30 rounded-3xl border border-white/5 backdrop-blur-sm mx-2">
            <Calendar size={48} className="mx-auto text-white/10 mb-5" />
            <p className="text-white/40 font-black text-xl uppercase tracking-[0.2em]">Quiet Day</p>
            <p className="text-white/20 text-sm mt-3 font-medium">No episodes scheduled for release.</p>
          </div>
        )}
      </div>

      {/* Recently Released Section */}
      <div className="max-w-[1440px] mx-auto mt-20">
        <div className="flex flex-col items-center mb-14">
            <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tighter text-[#f0ece8] text-center mb-5 uppercase italic">
                RECENTLY <span className="text-[#e2a84b] not-italic">RELEASED</span>
            </h2>
            <div className="flex items-center gap-4 w-full max-w-lg">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e2a84b]/40 to-[#e2a84b]/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e2a84b] shadow-[0_0_10px_#e2a84b]" />
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#e2a84b]/40 to-[#e2a84b]/20" />
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 px-2">
          {initialRecentlyReleased.map((anime: RecentlyReleasedAnime) => (
            <AnimeCard 
              key={anime.id} 
              anime={{
                id: anime.id,
                title: anime.title,
                coverImage: anime.coverImage,
                episodes: anime.latestEpisode || anime.episodes || "?",
                score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "?.?",
                status: anime.status
              }} 
              customHref={`/watch/${anime.id}?ep=${anime.latestEpisode || 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
