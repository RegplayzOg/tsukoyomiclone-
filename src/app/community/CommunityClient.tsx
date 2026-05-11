"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Lightbulb,
  MessagesSquare,
  Plus,
  Clock,
  MessageCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createCommunityPostAction, deleteCommunityPostAction } from "@/app/actions";
import { Trash2 } from "lucide-react";

type Post = Record<string, unknown>;
type User = Record<string, unknown>;

const channels = [
  { id: 'announcements', name: 'Announcements', icon: Megaphone, color: 'text-purple-400' },
  { id: 'suggestions', name: 'Suggestions', icon: Lightbulb, color: 'text-blue-400' },
  { id: 'general', name: 'General', icon: MessagesSquare, color: 'text-[#e2a84b]' },
];

export default function CommunityClient({ initialPosts, currentChannel, user }: { initialPosts: Post[], currentChannel: string | null, user: User }) {
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const channel = formData.get("channel") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const result = await createCommunityPostAction(channel, title, content);
    if (result.success) {
      setIsPosting(false);
      router.push(`/community/post/${result.id}`);
    } else {
      setError(result.error || "Failed to create post");
      setLoading(false);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setPostToDelete(postId);
  };

  const confirmDeletePost = async (postId: number) => {
    console.log("Attempting to delete post from list:", postId);
    const result = await deleteCommunityPostAction(postId);
    console.log("Delete post result:", result);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete post");
    }
  };

  const getTagColorClass = (color: string) => {
    switch (color) {
      case 'red': return "bg-red-500 text-white";
      case 'green': return "bg-green-500 text-white";
      case 'blue': return "bg-blue-500 text-white";
      case 'yellow': return "bg-[#e2a84b] text-[#07060d]";
      default: return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      
      {/* Sidebar Channels */}
      <aside className="space-y-6">
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 space-y-1">
          <Link 
            href="/community"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              !currentChannel ? "bg-[#e2a84b]/10 text-[#e2a84b] border border-[#e2a84b]/20" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <MessagesSquare size={18} />
            All Channels
          </Link>
          {channels.map((ch) => (
            <Link 
              key={ch.id}
              href={`/community?channel=${ch.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                currentChannel === ch.id ? "bg-[#e2a84b]/10 text-[#e2a84b] border border-[#e2a84b]/20" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <ch.icon size={18} className={cn(currentChannel === ch.id ? "text-[#e2a84b]" : ch.color)} />
              {ch.name}
            </Link>
          ))}
        </div>

        {user && (
          <button 
            onClick={() => setIsPosting(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#e2a84b] text-[#07060d] rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg"
          >
            <Plus size={18} />
            Create Post
          </button>
        )}
      </aside>

      {/* Posts List */}
      <div className="space-y-4">
        {initialPosts.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-2xl py-32 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <MessagesSquare size={32} />
            </div>
            <p className="text-white/40 text-sm">No posts found in this channel.</p>
          </div>
        ) : (
          initialPosts.map((post: Post) => (
            <div 
              key={post.id as number} 
              onClick={() => router.push(`/community/post/${post.id}`)}
              className="block bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-[#e2a84b]/30 hover:bg-[#161616] transition-all group cursor-pointer relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0c0c] border border-white/5 flex items-center justify-center font-bold text-[#e2a84b] flex-shrink-0 overflow-hidden relative">
                  {post.avatar_url ? (
                    <Image src={post.avatar_url as string} alt={post.username as string} fill className="object-cover" sizes="40px" />
                  ) : (
                    (post.username as string)[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/60">{post.username as string}</span>
                    {post.tag && (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                        getTagColorClass(post.tag_color as string)
                      )}>
                        {post.tag as string}
                      </span>
                    )}
                    <span className="text-[10px] text-white/20 font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(post.created_at as string).toLocaleDateString()}
                    </span>
                    <span className={cn(
                      "ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                      channels.find(c => c.id === post.channel)?.color,
                      "bg-white/5 border border-white/5"
                    )}>
                      {post.channel as string}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-[#e2a84b] transition-colors">{post.title as string}</h3>
                  <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                    {post.content as string}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-white/20 text-xs font-bold">
                        <MessageCircle size={14} />
                        {post.comment_count as number} comments
                      </div>
                      <div className="flex items-center gap-1 text-[#e2a84b] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                        Read More <ChevronRight size={12} />
                      </div>
                    </div>

                    {(user?.id === post.user_id || user?.role === 'admin') && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(e, post.id as number);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 relative z-20"
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
      {isPosting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Plus className="text-[#e2a84b]" />
                Create New Post
              </h3>
              <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Select Channel</label>
                  <select 
                    name="channel" 
                    required 
                    className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#e2a84b] appearance-none"
                  >
                    {user?.role === 'admin' && <option value="announcements">Announcements</option>}
                    <option value="general">General Discussion</option>
                    <option value="suggestions">Suggestions</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Title</label>
                <input 
                  name="title" 
                  required 
                  placeholder="Enter a catchy title..." 
                  className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#e2a84b]" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Content (Max 200 words)</label>
                <textarea 
                  name="content" 
                  required 
                  placeholder="What's on your mind?" 
                  className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-4 px-4 text-sm outline-none focus:border-[#e2a84b] min-h-[200px] resize-none" 
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsPosting(false)} 
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading} 
                  className="flex-1 py-4 rounded-2xl bg-[#e2a84b] text-[#07060d] text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
