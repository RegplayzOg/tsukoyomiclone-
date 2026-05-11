import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { User } from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import ProfileClient from "./ProfileClient";

type WatchlistItem = Record<string, unknown>;

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  const { rows } = await query("SELECT status FROM watchlists WHERE user_id = ?", [user.id]);
  const watchlist = rows as WatchlistItem[];

  const stats = {
    inList: watchlist.length,
    episodes: 0,
    hours: 0,
    watching: watchlist.filter((i: WatchlistItem) => i.status === 'CURRENT').length,
    completed: watchlist.filter((i: WatchlistItem) => i.status === 'COMPLETED').length,
    planToWatch: watchlist.filter((i: WatchlistItem) => i.status === 'PLANNING').length,
    onHold: watchlist.filter((i: WatchlistItem) => i.status === 'PAUSED').length,
    dropped: watchlist.filter((i: WatchlistItem) => i.status === 'DROPPED').length
  };

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <ProfileHeader />

        <ProfileClient user={user} stats={stats} />
      </main>

      <Footer />
    </div>
  );
}

function ProfileHeader() {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1d1a1a] border border-white/5 text-[0.65rem] font-bold text-[#f0ece8]/40 uppercase tracking-widest">
        <User size={12} className="text-[#e2a84b]" />
        Account
      </div>
      <h1 className="text-5xl font-[family-name:var(--font-cinzel)] font-black tracking-tight uppercase">
        My <span className="text-[#e2a84b]">Profile</span>
      </h1>
      <p className="text-sm text-[#f0ece8]/40 font-medium">
        Manage your account and view your anime stats.
      </p>
    </div>
  );
}
