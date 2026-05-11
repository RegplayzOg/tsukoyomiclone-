"use client";

import React, { useState } from "react";
import { X, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportUserAction, reportAnimeAction } from "@/app/actions";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'anime' | 'user';
  targetId: string | number;
}

export function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [scope, setScope] = useState<'whole' | 'few'>('whole');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (targetType === 'anime') {
        await reportAnimeAction(targetId as number, reason, details, scope === 'few' ? episodes : undefined);
    } else {
        await reportUserAction(targetId as string, reason, details);
    }
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Flag className="text-[#e2a84b]" size={18} />
                Report {targetType === 'anime' ? 'Anime' : 'User'}
            </h2>
            <button onClick={onClose}><X size={20} className="text-white/40 hover:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {targetType === 'anime' && (
                <div className="flex gap-4">
                    <button type="button" onClick={() => setScope('whole')} className={cn("flex-1 p-3 rounded border text-xs font-bold", scope === 'whole' ? "bg-[#e2a84b]/10 border-[#e2a84b]" : "bg-white/5 border-transparent")}>Whole Anime</button>
                    <button type="button" onClick={() => setScope('few')} className={cn("flex-1 p-3 rounded border text-xs font-bold", scope === 'few' ? "bg-[#e2a84b]/10 border-[#e2a84b]" : "bg-white/5 border-transparent")}>Few Episodes</button>
                </div>
            )}

            {scope === 'few' && (
                <input 
                    placeholder="Enter episodes (e.g. 1, 3, 5)"
                    className="w-full bg-[#0e0c0c] border border-white/5 rounded-xl p-3 text-sm text-white"
                    value={episodes}
                    onChange={(e) => setEpisodes(e.target.value)}
                />
            )}

            <select 
                className="w-full bg-[#0e0c0c] border border-white/5 rounded-xl p-3 text-sm text-white"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
            >
                <option value="">Select a Reason</option>
                <option value="broken">Broken Content</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="other">Other</option>
            </select>

            <textarea 
                placeholder="Detailed description..."
                className="w-full bg-[#0e0c0c] border border-white/5 rounded-xl p-3 text-sm text-white h-24"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
            />

            <button disabled={loading} className="w-full bg-[#e2a84b] text-black font-bold py-3 rounded-xl flex justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'Submit Report'}
            </button>
        </form>
      </div>
    </div>
  );
}
