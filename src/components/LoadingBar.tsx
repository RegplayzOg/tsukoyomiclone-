"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use a small delay to avoid the "set-state-in-effect" warning 
    // and to only show for non-instant navigations
    const startTimer = setTimeout(() => setLoading(true), 10);
    const endTimer = setTimeout(() => setLoading(false), 500);
    
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[9999] overflow-hidden">
      <div className="w-full h-full bg-white/10" />
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e2a84b] via-[#f0c66a] to-[#9d5ef5] animate-loading-bar"
      />
    </div>
  );
}
