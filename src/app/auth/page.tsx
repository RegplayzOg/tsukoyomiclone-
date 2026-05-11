"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { loginAction, signupAction } from "@/app/actions";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = mode === "login" 
      ? await loginAction(formData) 
      : await signupAction(formData);

    if (result.success) {
      router.push("/profile");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07060d] flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black italic tracking-tighter mb-2">
                <span className="bg-gradient-to-br from-[#e2a84b] via-[#f0c66a] to-[#9d5ef5] bg-clip-text text-transparent">Rz</span>
                <span className="text-white">Anime</span>
            </h1>
            <p className="text-white/50 text-sm">Join the community to discuss your favorite anime</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
             <div className="relative">
                <User className="absolute left-3 top-3.5 text-white/30" size={18} />
                <input name="username" type="text" placeholder="Username" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-[#e2a84b]" />
             </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-white/30" size={18} />
            <input name="email" type="email" placeholder="Email" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-[#e2a84b]" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-white/30" size={18} />
            <input name="password" type="password" placeholder="Password" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-[#e2a84b]" />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-[#e2a84b] text-[#07060d] font-bold py-4 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        
        <p className="text-center text-white/50 text-sm mt-8">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[#e2a84b] font-bold hover:underline">
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}
