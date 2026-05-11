"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutGrid, Users, Menu, X, User, Bookmark, LogOut, Shield, Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUserAction, logoutAction } from "@/app/actions";

type User = Record<string, unknown>;

const navLinks = [
  { name: "Home", href: "/", icon: House },
  { name: "Browse", href: "/browse", icon: LayoutGrid },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Community", href: "/community", icon: Users },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const fetchUser = async () => {
      const user = await getCurrentUserAction();
      setCurrentUser(user);
    };

    fetchUser();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    setCurrentUser(null);
    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[1000] h-[52px] flex items-center transition-all duration-200 border-b border-transparent",
      isScrolled && "bg-[rgba(14,12,12,0.85)] backdrop-blur-[14px] border-b-[rgba(255,255,255,0.06)] h-12"
    )}>
      <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-8 no-underline group">
          <span className="relative flex items-center font-[family-name:var(--font-geist-sans)] italic font-black text-[1.25rem] tracking-tighter transition-all duration-300 group-hover:scale-[1.02]">
            <span className="bg-gradient-to-br from-[#e2a84b] via-[#f0c66a] to-[#9d5ef5] bg-clip-text text-transparent">Rz</span>
            <span className="text-[#f0ece8]">Dev</span>
            <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#e2a84b] transition-all duration-300 group-hover:w-full opacity-50" />
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-[7px] h-8 px-3 rounded-md text-[0.75rem] font-semibold transition-all duration-[120ms] no-underline",
                  isActive
                    ? "text-[#e2a84b] bg-[rgba(226,168,75,0.10)] border border-[rgba(226,168,75,0.26)]"
                    : "text-[rgba(240,236,232,0.26)] hover:text-[#f0ece8] hover:bg-[rgba(240,236,232,0.03)]"
                )}
              >
                <span className="relative">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span className="relative">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Search Toggle */}
        <div className="relative flex items-center">
          {isSearchOpen && (
            <form onSubmit={handleSearch} className="absolute right-full mr-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-1.5 text-[0.75rem] text-white outline-none focus:border-[#e2a84b] w-48"
              />
            </form>
          )}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="bg-transparent border-none cursor-pointer text-[rgba(240,236,232,0.26)] p-2 transition-colors duration-[120ms] hover:text-[#f0ece8]" 
            title="Search"
          >
            {isSearchOpen ? <X size={15} strokeWidth={2} /> : <Search size={15} strokeWidth={2} />}
          </button>
        </div>

        {/* Language Toggle */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[0.58rem] font-bold tracking-wider text-[rgba(240,236,232,0.26)] uppercase hover:text-[#f0ece8] transition-colors">
          <div className="w-1.5 h-1.5 bg-[rgba(255,255,255,0.11)] rounded-full" />
          EN
        </button>

        {/* Profile/Auth Actions */}
        <div className="flex items-center gap-2.5 ml-3">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1 hover:border-[#e2a84b] transition-all"
              >
                {currentUser.avatar_url ? (
                  <Image src={currentUser.avatar_url} alt={currentUser.username} width={24} height={24} className="rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e2a84b] to-[#9d5ef5]" />
                )}
                <span className="text-[0.75rem] font-bold text-[#e2a84b]">{currentUser.username}</span>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#121212] border border-white/10 rounded-xl p-2 shadow-2xl space-y-1">
                  <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-sm text-white/70 hover:text-white">
                    <User size={16} /> My Account
                  </Link>
                  <Link href={`/user/${currentUser.id}`} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-sm text-white/70 hover:text-white">
                    <Users size={16} /> Public Profile
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-sm text-purple-400 hover:text-purple-300">
                      <Shield size={16} /> Admin Area
                    </Link>
                  )}
                  <Link href="/watchlist" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-sm text-white/70 hover:text-white border-t border-white/5">
                    <Bookmark size={16} /> My Watchlist
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 hover:bg-red-500/10 rounded-lg text-sm text-red-400 hover:text-red-300 border-t border-white/5">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/auth" className="bg-transparent border border-[rgba(255,255,255,0.06)] rounded-md text-[#f0ece8] text-[0.72rem] font-semibold px-[14px] py-[6px] cursor-pointer transition-all duration-[120ms] hover:bg-[rgba(240,236,232,0.03)] hover:border-[rgba(240,236,232,0.30)]">
                Login
              </Link>
              <Link href="/auth" className="bg-[#e2a84b] border-none rounded-md text-[#07060d] text-[0.72rem] font-bold px-4 py-[6px] cursor-pointer transition-[filter] duration-[120ms] hover:brightness-110">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <button className="lg:hidden bg-transparent border-none cursor-pointer text-[rgba(240,236,232,0.26)] p-2 ml-2 transition-colors duration-[120ms] hover:text-[#f0ece8]">
          <Menu size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
