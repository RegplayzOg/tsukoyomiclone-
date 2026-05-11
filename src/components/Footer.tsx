import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[rgba(255,255,255,0.06)] bg-[#0e0c0c]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 xl:px-24 py-16 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-12 items-start">
        <div className="flex flex-col items-start">
          <Link href="/" className="no-underline group">
            <span className="relative flex items-center font-[family-name:var(--font-geist-sans)] italic font-black text-[1.5rem] tracking-tighter transition-all duration-300">
              <span className="bg-gradient-to-br from-[#e2a84b] via-[#f0c66a] to-[#9d5ef5] bg-clip-text text-transparent">Rz</span>
              <span className="text-[#f0ece8]">Dev</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-col items-start md:items-center">
          <p className="font-[family-name:var(--font-cinzel)] text-[0.7rem] tracking-[0.2em] uppercase text-[#e2a84b] mb-2 font-bold">
            WHERE STORIES NEVER END
          </p>
          <p className="text-[0.8rem] text-[rgba(240,236,232,0.52)] leading-relaxed mb-4 max-w-md text-left md:text-center">
            Premium anime streaming, always free. Made for fans, by fans.
          </p>
          <div className="flex items-center gap-3">
            <a className="flex items-center justify-center w-10 h-10 rounded-md bg-[rgba(88,101,242,0.1)] border border-[rgba(88,101,242,0.3)] text-[#7289da] transition-all duration-200 hover:bg-[rgba(88,101,242,0.2)] hover:border-[#7289da]" href="#" target="_blank" title="Join Discord">
              <svg fill="currentColor" height="22" viewBox="0 0 127.14 96.36" width="22">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </a>
            <a className="flex items-center justify-center w-10 h-10 rounded-md bg-[rgba(255,69,0,0.08)] border border-[rgba(255,69,0,0.25)] text-[#ff6b4a] transition-all duration-200 hover:bg-[rgba(255,69,0,0.15)] hover:border-[#ff6b4a]" href="#" target="_blank" title="Join Reddit">
              <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                <path d="M24 11.5c0-1.65-1.35-3-3-3-.41 0-.78.08-1.12.24C18.17 7.53 15.83 6.75 13.25 6.5l.54-2.43 1.74.38c.03.81.69 1.47 1.5 1.47 1.1 0 2-.9 2-2s-.9-2-2-2c-.81 0-1.48.48-1.78 1.17l-1.95-.43c-.15-.03-.3.02-.38.15L12.5 6.5c-2.6.25-4.96 1.04-6.66 2.25-.33-.16-.71-.25-1.12-.25-1.65 0-3 1.35-3 3 0 1.25.77 2.32 1.86 2.76-.04.25-.06.5-.06.75 0 3.31 4.03 6 9 6s9-2.69 9-6c0-.25-.02-.5-.06-.75 1.1-.44 1.86-1.51 1.86-2.76zm-17.5 2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm9 3.5c-1.5 1.5-4.5 1.5-6 0-.15-.15-.15-.39 0-.54.15-.15.39-.15.54 0 1.17 1.17 3.74 1.17 4.92 0 .15-.15.39-.15.54 0 .15.15.15.39 0 .54zm-.5-2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 text-[0.75rem]">
          <div>
            <ul className="space-y-2">
              <li><Link href="/" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Home</Link></li>
              <li><Link href="/browse?sort=trending" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Trending</Link></li>
              <li><Link href="/browse?sort=popular" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Popular</Link></li>
              <li><Link href="/browse?sort=toprated" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Top Rated</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li><Link href="/profile" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Profile</Link></li>
              <li><Link href="/watchlist" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Watchlist</Link></li>
              <li><Link href="/continue" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Continue</Link></li>
              <li><Link href="/history" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">History</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">About</Link></li>
              <li><Link href="/donate" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Donate</Link></li>
              <li><Link href="/privacy" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-[rgba(240,236,232,0.52)] hover:text-[#e2a84b] transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.06)] py-6 px-4 lg:px-20 xl:px-24 text-center text-[0.68rem] text-[rgba(240,236,232,0.26)] leading-relaxed">
        © 2026 RzDev · All titles belong to their respective copyright holders · This site does not locally store or host any files on its server. All content is provided by non-affiliated third party services.
      </div>
    </footer>
  );
}
