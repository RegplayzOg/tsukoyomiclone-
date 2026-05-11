"use client";

import React, { useState } from "react";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import { verifyAdminPasswordAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyAdminPasswordAction(password);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Invalid password");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-[#111111] border border-white/5 p-10 rounded-3xl shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-[#e2a84b]/10 rounded-full flex items-center justify-center mx-auto border border-[#e2a84b]/20">
          <ShieldAlert size={40} className="text-[#e2a84b]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Restricted Area</h2>
          <p className="text-white/40 text-sm">Please enter the administrative password to continue.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-white/20" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password" 
              className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#e2a84b]" 
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-[#e2a84b] text-[#07060d] font-bold py-4 rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Verify Identity
          </button>
        </form>
      </div>
    </div>
  );
}
