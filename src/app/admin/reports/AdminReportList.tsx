"use client";

import React, { useState } from "react";
import { deleteReportAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

type Report = Record<string, unknown>;

export function AdminReportList({ reports, type, page }: { reports: Report[], type: 'anime' | 'user', page: number }) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const router = useRouter();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleString();
  };

  const handleDelete = async (id: number) => {
    await deleteReportAction(id);
    router.refresh();
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
      <ConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={() => {
          if (reportToDelete) handleDelete(reportToDelete);
          setReportToDelete(null);
        }}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
      />
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Report Details</h3>
              <button onClick={() => setSelectedReport(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-white/60 bg-white/5 p-4 rounded-xl">{selectedReport.details as string}</p>
          </div>
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            <th className="p-4 text-left">Reporter</th>
            <th className="p-4 text-left">{type === 'anime' ? 'Anime ID' : 'Target ID'}</th>
            <th className="p-4 text-left">Reason</th>
            <th className="p-4 text-left">Time</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r: Report) => (
            <tr key={r.id as number} className="border-t border-white/5">
              <td className="p-4">{r.reporter_name as string}</td>
              <td className="p-4">{type === 'anime' ? r.anime_id as number : r.target_id as string}</td>
              <td className="p-4">{r.reason as string}</td>
              <td className="p-4">{formatTime(r.created_at as string)}</td>
              <td className="p-4 flex gap-2">
                <button onClick={() => setSelectedReport(r)} className="px-3 py-1.5 border border-white/10 rounded-lg text-white/60 hover:text-[#e2a84b] hover:border-[#e2a84b]/50 transition-all text-[10px] font-black uppercase tracking-widest">View</button>
                <button onClick={() => setReportToDelete(r.id as number)} className="px-3 py-1.5 border border-red-500/10 rounded-lg text-red-400/60 hover:text-red-400 hover:border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {reports.length >= 20 && (
        <div className="p-4 flex gap-2">
          {page > 1 && (
            <a href={`?page=${Math.max(1, page - 1)}&type=${type}`} className="px-4 py-2 bg-white/5 rounded">Prev</a>
          )}
          <a href={`?page=${page + 1}&type=${type}`} className="px-4 py-2 bg-white/5 rounded">Next</a>
        </div>
      )}
    </div>
  );
}
