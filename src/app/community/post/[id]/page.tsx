import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCommunityPostAction, getCommunityCommentsAction } from "@/app/actions";
import { notFound } from "next/navigation";
import PostDetailClient from "./PostDetailClient";
import { getUser } from "@/lib/auth";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const postId = parseInt(id);

  if (isNaN(postId)) notFound();

  const post = await getCommunityPostAction(postId);
  const comments = await getCommunityCommentsAction(postId);
  const user = await getUser();

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <PostDetailClient post={post} initialComments={comments} user={user} />
      </main>

      <Footer />
    </div>
  );
}
