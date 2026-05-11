import React from "react";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { Award, Clock, ShieldCheck, Trophy, Zap, Folder, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import { ReportUser } from "./ReportUser";

type User = Record<string, unknown>;
type WatchlistItem = Record<string, unknown>;

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { rows } = await query("SELECT * FROM users WHERE id = ? OR username = ?", [id, id]);
  const users = rows as User[];

  if (users.length === 0) {
    notFound();
  }

  const user = users[0];
  const isPrivate = user.watchlist_privacy === 1;

  const { rows: watchlistRows } = await query(`
    SELECT w.*, c.data as anime_data
    FROM watchlists w
    LEFT JOIN cache c ON CONCAT('anime:', w.anime_id) = c.key
    WHERE w.user_id = ?
  `, [user.id]);

  const watchlist = (watchlistRows as WatchlistItem[]).map(item => ({
    ...item,
    anime_data: item.anime_data ? JSON.parse(item.anime_data as string) : null
  }));

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Profile Sidebar */}
          <div className="w-full md:w-80 space-y-6 flex-shrink-0">
            {/* Sidebar content remains the same */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden group">
              {/* ... existing sidebar code ... */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#e2a84b]/5 rounded-full blur-3xl" />
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0c0c] border-2 border-white/5 mx-auto flex items-center justify-center text-5xl font-bold text-[#e2a84b] shadow-2xl relative overflow-hidden">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.username} fill className="object-cover" sizes="128px" />
                ) : (
                  (user.username?.charAt(0) || '?').toUpperCase()
                )}
              </div>
              <div className="space-y-1 relative z-10">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-bold text-[#f0ece8]">{user.username}</h2>
                  {user.tag && (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[0.6rem] font-black uppercase",
                      user.tag_color === 'red' ? "bg-red-500 text-white" :
                      user.tag_color === 'green' ? "bg-green-500 text-white" :
                      user.tag_color === 'blue' ? "bg-blue-500 text-white" :
                      "bg-[#e2a84b] text-[#07060d]"
                    )}>
                      {user.tag}
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">
                  {user.role}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 w-full relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2a84b]/10 border border-[#e2a84b]/20 text-[0.65rem] font-black text-[#e2a84b] uppercase tracking-[0.15em]">
                  <Award size={12} />
                  {user.rank}
                </div>
                <div className="flex items-center gap-1.5 text-[0.65rem] text-[#f0ece8]/40">
                  <Clock size={12} />
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <ReportUser targetId={user.id} />
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f0ece8]/60">
                <ShieldCheck size={14} className="text-[#e2a84b]" />
                Identity
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-[#f0ece8]/40 uppercase">
                    <Zap size={10} className="text-[#e2a84b]" />
                    XP
                  </div>
                  <div className="text-2xl font-black text-[#e2a84b]">{user.xp}</div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-[#f0ece8]/40 uppercase">
                    <Trophy size={10} className="text-[#e2a84b]" />
                    Rank
                  </div>
                  <div className="text-sm font-black text-[#f0ece8] truncate">{user.rank}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Folder className="text-[#e2a84b]" size={20} />
                Watchlist
              </h3>
              
              {isPrivate ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#0e0c0c] rounded-xl border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-white/60">Watchlist is Private</div>
                    <p className="text-sm text-white/30 max-w-xs">This user has chosen to keep their watchlist hidden.</p>
                  </div>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-[#0e0c0c] rounded-xl border border-white/5">
                  <Play className="text-white/20" size={32} />
                  <div className="text-lg font-bold text-white/40">Watchlist is Empty</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlist.map((item: WatchlistItem) => (
                    <div key={item.anime_id} className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 bg-[#0e0c0c]">
                      {item.anime_data?.coverImage && (
                        <Image
                          src={item.anime_data.coverImage.large}
                          alt={item.anime_data.title.romaji}
                          fill
                          className="object-cover opacity-80"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-[10px] font-bold text-white truncate">{item.anime_data?.title.romaji}</div>
                        <div className="text-[8px] font-bold text-[#e2a84b] uppercase tracking-wider">EP {item.progress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
