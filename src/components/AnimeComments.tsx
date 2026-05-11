"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Pin,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addAnimeCommentAction, getAnimeCommentsAction, deleteAnimeCommentAction, pinAnimeCommentAction, getCurrentUserAction } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { ConfirmationModal } from "@/components/ConfirmationModal";

interface AnimeCommentsProps {
  animeId: number;
}

interface Comment {
  id: number;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  is_pinned?: boolean;
  tag?: string;
  tag_color?: string;
  avatar_url?: string;
}

type User = Record<string, unknown>;

export function AnimeComments({ animeId }: AnimeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const data = await getAnimeCommentsAction(animeId);
    if (Array.isArray(data)) {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [animeId]);

  useEffect(() => {
    (async () => {
      await fetchComments();
      const u = await getCurrentUserAction();
      setUser(u as User);
    })();
  }, [animeId, fetchComments]);

  const handleDeleteComment = async (commentId: number) => {
    const result = await deleteAnimeCommentAction(commentId);
    if (result.success) {
      fetchComments();
    } else {
      alert(result.error || "Failed to delete comment");
    }
  };

  const handlePinComment = async (commentId: number, currentPinned: boolean) => {
    const result = await pinAnimeCommentAction(commentId, !currentPinned);
    if (result.success) {
      fetchComments();
    } else {
      alert(result.error || "Failed to pin comment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await addAnimeCommentAction(animeId, content);
    if (result.success) {
      setContent("");
      fetchComments();
    } else {
      setError(result.error || "Failed to post comment");
    }
    setSubmitting(false);
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

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 30) return `${diffInDays} day ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month ago`;
    return `${Math.floor(diffInDays / 365)} year ago`;
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-6 shadow-xl space-y-8">
      <ConfirmationModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => {
          if (commentToDelete) handleDeleteComment(commentToDelete);
          setCommentToDelete(null);
        }}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
      />
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
          <MessageSquare className="text-[#e2a84b]" size={16} />
          Comments
        </h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="relative group">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment... (max 200 words)"
              className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#e2a84b]/30 transition-all min-h-[100px] resize-none"
              disabled={submitting}
            />
            <button 
              type="submit"
              disabled={submitting || !content.trim()}
              className="absolute bottom-4 right-4 p-2.5 rounded-lg bg-[#e2a84b] text-[#07060d] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 text-center">
          <p className="text-white/40 text-sm">Please <Link href="/auth" className="text-[#e2a84b] font-bold hover:underline">sign in</Link> to comment.</p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#e2a84b]" size={32} />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-20 text-center text-white/20 text-sm italic">
            No comments yet. Be the first to start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={cn(
                "p-4 bg-[#1a1a1a] border border-white/5 rounded-xl flex gap-4 animate-in fade-in duration-500 group/comment relative",
                !!comment.is_pinned && "border-l-2 border-[#e2a84b]"
              )}>
                {!!comment.is_pinned && (
                  <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[9px] font-black uppercase text-[#e2a84b] tracking-widest">
                    <Pin size={10} fill="currentColor" />
                    Pinned
                  </div>
                )}
                <Link href={`/user/${comment.user_id}`} className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0c0c] border border-white/5 flex items-center justify-center font-bold text-[#e2a84b] overflow-hidden relative">
                    {comment.avatar_url ? (
                      <Image src={comment.avatar_url} alt={comment.username} fill className="object-cover" sizes="40px" />
                    ) : (
                      (comment.username?.charAt(0) || '?').toUpperCase()
                    )}
                  </div>
                </Link>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${comment.user_id}`} className="text-sm font-bold hover:text-[#e2a84b] transition-colors truncate">
                      {comment.username}
                    </Link>
                    {comment.tag && (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                        getTagColorClass(comment.tag_color || '')
                      )}>
                        {comment.tag}
                      </span>
                    )}
                    <span className="text-[10px] text-white/20 font-mono">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed break-words">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-3 pt-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handlePinComment(comment.id, !!comment.is_pinned)}
                        className={cn(
                          "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                          !!comment.is_pinned ? "text-[#e2a84b]" : "text-white/20 hover:text-white"
                        )}
                      >
                        <Pin size={12} fill={!!comment.is_pinned ? "currentColor" : "none"} />
                        {!!comment.is_pinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                    {(user?.id === comment.user_id || user?.role === 'admin') && (
                      <button 
                        onClick={() => setCommentToDelete(comment.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
