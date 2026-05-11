"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "@/components/ReportModal";

export function ReportUser({ targetId }: { targetId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-20">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
      >
        <Flag size={14} />
        Report User
      </button>

      <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} targetType="user" targetId={targetId} />
    </div>
  );
}
