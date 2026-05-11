"use client";

import React, { useState } from "react";
import {
  Library,
  Upload,
  Bookmark,
  Loader2,
  Search
} from "lucide-react";
import Link from "next/link";
import { syncAniListAction, updateWatchlistAction, removeFromWatchlistAction } from "@/app/actions";
import { WatchlistCard } from "@/components/WatchlistCard";
import { cn } from "@/lib/utils";

type WatchlistItem = Record<string, unknown>;
type User = Record<string, unknown>;

const filters = [
  { id: 'ALL', name: 'ALL' },
  { id: 'CURRENT', name: 'WATCHING' },
  { id: 'COMPLETED', name: 'COMPLETED' },
  { id: 'PLANNING', name: 'PLAN TO WATCH' },
  { id: 'PAUSED', name: 'ON HOLD' },
  { id: 'DROPPED', name: 'DROPPED' },
];

export default function WatchlistClient({ initialWatchlist, user }: { initialWatchlist: WatchlistItem[], user: User }) {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredWatchlist = watchlist.filter((item: WatchlistItem) =>
    activeFilter === 'ALL' || item.status === activeFilter
  );

  const paginatedWatchlist = filteredWatchlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWatchlist.length / itemsPerPage);

  const handleUpdate = async (animeId: number, status: string | null) => {
    setEditingId(animeId);
    if (status === null) {
      await removeFromWatchlistAction(animeId);
      setWatchlist(watchlist.filter((i: WatchlistItem) => i.anime_id !== animeId));
    } else {
      await updateWatchlistAction(animeId, { status, progress: 0, score: 0 });
      setWatchlist(watchlist.map((i: WatchlistItem) => i.anime_id === animeId ? { ...i, status } : i));
    }
    setEditingId(null);
  };

  const handleSync = async () => {
    if (!user.anilist_id) {
      // Trigger AniList OAuth
      const clientId = process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID || '22565';
      const redirectUri = window.location.origin + '/api/auth/anilist/callback';
      window.location.href = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
      return;
    }

    setSyncing(true);
    const result = await syncAniListAction();
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Sync failed");
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1d1a1a] border border-white/5 text-[0.65rem] font-bold text-[#f0ece8]/40 uppercase tracking-widest">
            <Library size={12} className="text-[#e2a84b]" />
            Library
          </div>
          <h1 className="text-5xl font-[family-name:var(--font-cinzel)] font-black tracking-tight uppercase">
            My <span className="text-[#e2a84b]">Watchlist</span>
          </h1>
          <p className="text-sm text-[#f0ece8]/40 font-medium">
            {watchlist.length} anime in your list
          </p>
        </div>

        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-[#e2a84b]/30 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {user.anilist_id ? "Sync AniList" : "Import"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="pt-8 border-t border-white/5">
        <div className="flex flex-col gap-4">
          <label className="text-[0.6rem] font-black text-[#f0ece8]/20 uppercase tracking-[0.2em]">Filter</label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all border",
                  activeFilter === filter.id 
                    ? "bg-[#e2a84b] border-[#e2a84b] text-[#07060d] shadow-[0_0_20px_rgba(226,168,75,0.2)]" 
                    : "bg-white/5 border-white/5 text-[#f0ece8]/40 hover:text-[#f0ece8]/60 hover:bg-white/10"
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All Anime Section */}
      <div className="pt-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[0.6rem] font-black text-[#f0ece8]/20 uppercase tracking-[0.3em]">All Anime</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {paginatedWatchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
              <Bookmark size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white/60">Your watchlist is empty</h3>
              <p className="text-sm text-white/20">Browse anime and add them to your list.</p>
            </div>
            <Link 
              href="/browse"
              className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-90 transition-all shadow-xl"
            >
              <Search size={16} />
              Browse Anime
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedWatchlist.map((item: WatchlistItem) => (
                <WatchlistCard 
                  key={item.anime_id} 
                  item={item} 
                  onUpdate={handleUpdate} 
                  statusOptions={filters} 
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                      currentPage === i + 1 
                        ? "bg-[#e2a84b] text-black" 
                        : "bg-white/5 hover:bg-white/10 text-white/40"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
