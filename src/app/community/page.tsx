import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCommunityPostsAction } from "@/app/actions";
import CommunityClient from "./CommunityClient";
import { getUser } from "@/lib/auth";

export default async function CommunityPage({ searchParams }: { searchParams: { channel?: string } }) {
  const { channel } = await searchParams;
  const posts = await getCommunityPostsAction(channel);
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <div className="flex flex-col gap-2 mb-12">
          <h1 className="text-4xl font-[family-name:var(--font-cinzel)] font-black uppercase tracking-tighter">
            Community <span className="text-[#e2a84b]">Hub</span>
          </h1>
          <p className="text-white/40 text-sm">Join the discussion, share suggestions, and stay updated.</p>
        </div>

        <CommunityClient initialPosts={posts} currentChannel={channel} user={user} />
      </main>

      <Footer />
    </div>
  );
}
