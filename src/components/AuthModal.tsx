"use client";

import React, { useState } from "react";
import { X, Mail, Lock } from "lucide-react";

export function AuthModal({ isOpen, onClose, initialMode = "login" }: { isOpen: boolean; onClose: () => void; initialMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl w-full max-w-sm relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-white text-2xl font-bold mb-6">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-white/30" size={18} />
            <input type="email" placeholder="Email" className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-[#e2a84b]" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-white/30" size={18} />
            <input type="password" placeholder="Password" className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 outline-none focus:border-[#e2a84b]" />
          </div>
          <button className="w-full bg-[#e2a84b] text-[#07060d] font-bold py-2.5 rounded-lg hover:brightness-110 transition-all">
            {mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </div>
        <p className="text-center text-white/50 text-sm mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[#e2a84b] font-bold hover:underline">
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
