import React from "react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportsAction } from "@/app/actions";
import { AdminReportList } from "./AdminReportList";

export default async function AdminReportsPage({ searchParams }: { searchParams: { page?: string, type?: string } }) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect("/");

  const page = parseInt(searchParams.page || "1");
  const type = (searchParams.type || "anime") as 'anime' | 'user';
  const reports = await getReportsAction(type, page);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Manage Reports</h1>
      <div className="flex gap-4">
        <a href="?type=anime" className={`px-4 py-2 rounded ${type === 'anime' ? 'bg-[#e2a84b] text-black' : 'bg-white/5'}`}>Anime Reports</a>
        <a href="?type=user" className={`px-4 py-2 rounded ${type === 'user' ? 'bg-[#e2a84b] text-black' : 'bg-white/5'}`}>User Reports</a>
      </div>
      
      <AdminReportList reports={reports} type={type} page={page} />
    </div>
  );
}
