"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { addCommunityCommentAction, deleteCommunityPostAction, pinCommunityCommentAction, deleteCommunityCommentAction } from "@/app/actions";
import { Trash2, Pin } from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

type Post = Record<string, unknown>;
type Comment = Record<string, unknown>;
type User = Record<string, unknown>;

export default function PostDetailClient({ post, initialComments, user }: { post: Post, initialComments: Comment[], user: User }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetToDelete, setTargetToDelete] = useState<{type: 'post' | 'comment', id: number} | null>(null);
  const [replyTo, setReplyTo] = useState<{id: number, username: string, content: string} | null>(null);
  const router = useRouter();

  const handlePinComment = async (commentId: number, currentPinned: boolean) => {
    const result = await pinCommunityCommentAction(commentId, !currentPinned);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to pin comment");
    }
  };

  const confirmDeleteComment = async (commentId: number) => {
    const result = await deleteCommunityCommentAction(commentId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete comment");
    }
  };

  const confirmDeletePost = async (postId: number) => {
    const result = await deleteCommunityPostAction(postId);
    if (result.success) {
      router.push("/community");
    } else {
      alert(result.error || "Failed to delete post");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await addCommunityCommentAction(post.id as number, content, replyTo?.id);
    if (result.success) {
      setContent("");
      setReplyTo(null);
      router.refresh();
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ConfirmationModal
        isOpen={!!targetToDelete}
        onClose={() => setTargetToDelete(null)}
        onConfirm={() => {
          if (targetToDelete?.type === 'post') confirmDeletePost(targetToDelete.id);
          else if (targetToDelete?.type === 'comment') confirmDeleteComment(targetToDelete.id);
          setTargetToDelete(null);
        }}
        title={`Delete ${targetToDelete?.type === 'post' ? 'Post' : 'Comment'}`}
        description={`Are you sure you want to delete this ${targetToDelete?.type}? This action cannot be undone.`}
      />
      <div className="flex items-center justify-between">
        <Link 
          href="/community" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#e2a84b] transition-all text-sm font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Community
        </Link>

        {(user?.id === post.user_id || user?.role === 'admin') && (
          <button 
            type="button"
            onClick={() => setTargetToDelete({type: 'post', id: post.id as number})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all relative z-20"
          >
            <Trash2 size={14} />
            Delete Post
          </button>
        )}
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/user/${post.user_id}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0c0c] border border-white/5 flex items-center justify-center font-bold text-[#e2a84b] overflow-hidden relative">
              {post.avatar_url ? (
                <Image src={post.avatar_url as string} alt={post.username as string} fill className="object-cover" sizes="48px" />
              ) : (
                (post.username as string)[0].toUpperCase()
              )}
            </div>
          </Link>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <Link href={`/user/${post.user_id}`} className="text-base font-bold hover:text-[#e2a84b] transition-colors">
                {post.username as string}
              </Link>
              {post.tag && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                  getTagColorClass(post.tag_color as string)
                )}>
                  {post.tag as string}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/20 font-mono">
              <Clock size={12} />
              {new Date(post.created_at as string).toLocaleString()}
              <span className="mx-2">•</span>
              <span className="uppercase tracking-widest text-[#e2a84b]/60">{post.channel as string}</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black">{post.title as string}</h1>
        <p className="text-white/60 leading-relaxed text-lg whitespace-pre-wrap">
          {post.content as string}
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <MessageSquare className="text-[#e2a84b]" size={20} />
          <h2 className="text-xl font-bold">Discussion <span className="text-white/20 ml-2 text-sm">{initialComments.length}</span></h2>
        </div>

        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <div className="relative group">
              {replyTo && (
                <div className="bg-[#1e1e1e] p-4 rounded-t-2xl border-b border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-black">
                    Replying to @{replyTo.username}
                    <button type="button" onClick={() => setReplyTo(null)} className="hover:text-white"><X size={12} /></button>
                  </div>
                  <div className="flex gap-3 items-start border-l-2 border-[#e2a84b] pl-3 py-1">
                     <p className="text-xs text-white/60 italic">"{replyTo.content}"</p>
                  </div>
                </div>
              )}
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? "Write your reply..." : "What do you think? (max 200 words)"}
                className={cn(
                  "w-full bg-[#111111] border border-white/5 p-6 text-sm outline-none focus:border-[#e2a84b]/30 transition-all min-h-[120px] resize-none",
                  replyTo ? "rounded-b-2xl" : "rounded-2xl"
                )}
              />
              <button 
                type="submit"
                disabled={submitting || !content.trim()}
                className="absolute bottom-6 right-6 px-6 py-2.5 rounded-xl bg-[#e2a84b] text-[#07060d] font-black uppercase text-[10px] tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                {replyTo ? "Post Reply" : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">Please <Link href="/auth" className="text-[#e2a84b] font-bold hover:underline">sign in</Link> to participate in the discussion.</p>
          </div>
        )}

        <div className="space-y-4">
          {initialComments.length === 0 ? (
            <p className="text-center text-white/20 py-10 italic">No comments yet. Start the conversation!</p>
          ) : (
            initialComments.map((comment: Comment) => (
              <div key={comment.id as number} className="space-y-2">
                {!!comment.parent_id && (
                  <div className="ml-12 border-l-2 border-[#e2a84b]/20 pl-4 py-1 mb-1">
                    {(() => {
                      const parent = initialComments.find(c => (c as any).id === comment.parent_id);
                      return parent ? (
                        <>
                          <div className="text-[10px] text-[#e2a84b] font-black uppercase tracking-widest mb-0.5">
                            Replying to @{(parent as any).username}
                          </div>
                          <p className="text-[10px] text-white/40 italic truncate border-l-2 border-white/5 pl-2">
                            "{(parent as any).content}"
                          </p>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/20 italic">Message unavailable</div>
                      );
                    })()}
                  </div>
                )}
                <div className={cn(
                  "bg-[#111111] border border-white/5 rounded-2xl p-6 flex gap-4 animate-in fade-in duration-500 group/comment relative transition-all",
                  !!comment.is_pinned && "border-[#e2a84b]/30 bg-[#e2a84b]/5 shadow-[0_0_30px_rgba(226,168,75,0.05)]",
                  !!comment.parent_id && "ml-12 border-l-4 border-l-[#e2a84b]/20"
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
                        <Image src={comment.avatar_url as string} alt={comment.username as string} fill className="object-cover" sizes="40px" />
                      ) : (
                        (comment.username as string)[0].toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <Link href={`/user/${comment.user_id}`} className="text-sm font-bold hover:text-[#e2a84b] transition-colors truncate">
                        {comment.username as string}
                      </Link>
                      {comment.tag && (
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                          getTagColorClass(comment.tag_color as string)
                        )}>
                          {comment.tag as string}
                        </span>
                      )}
                      <span className="text-[10px] text-white/20 font-mono ml-auto">
                        {new Date(comment.created_at as string).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed break-words">
                      {comment.content as string}
                    </p>

                    <div className="flex items-center gap-3 pt-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => setReplyTo({id: comment.id as number, username: comment.username as string, content: comment.content as string})}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-[#e2a84b] transition-all relative z-20"
                      >
                        <MessageSquare size={12} />
                        Reply
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handlePinComment(comment.id as number, !!comment.is_pinned)}
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
                          type="button"
                          onClick={() => setTargetToDelete({type: 'comment', id: comment.id as number})}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-all relative z-20"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
