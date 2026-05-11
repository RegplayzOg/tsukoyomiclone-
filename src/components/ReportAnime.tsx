"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "@/components/ReportModal";

export function ReportAnime({ animeId }: { animeId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-20">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-transparent hover:bg-white/5 border border-white/20 text-white rounded transition-all"
        title="Report Anime"
      >
        <Flag size={14} />
      </button>

      <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} targetType="anime" targetId={animeId} />
    </div>
  );
}
