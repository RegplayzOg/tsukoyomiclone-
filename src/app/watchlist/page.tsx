import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getWatchlistAction } from "@/app/actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import WatchlistClient from "./WatchlistClient";

export default async function WatchlistPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  const watchlist = await getWatchlistAction();

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <WatchlistClient initialWatchlist={watchlist} user={user} />
      </main>

      <Footer />
    </div>
  );
}
