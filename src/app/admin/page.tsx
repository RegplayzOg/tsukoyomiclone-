import React from "react";
import { getUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AdminContent from "./AdminContent";
import AdminLogin from "./AdminLogin";

export default async function AdminPage() {
  const user = await getUser();

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#0e0c0c] text-[#f0ece8] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 pt-24 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-[family-name:var(--font-cinzel)] font-black uppercase tracking-tighter">
            Admin <span className="text-[#e2a84b]">Dashboard</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Manage users and platform configuration.</p>
        </div>

        {isAdmin ? (
          <AdminContent />
        ) : (
          <AdminLogin />
        )}
      </main>

      <Footer />
    </div>
  );
}
