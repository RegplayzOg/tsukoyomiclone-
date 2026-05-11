"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchAnimeAction } from "@/app/actions";
import { BrowseCard } from "./BrowseCard";
import { cn } from "@/lib/utils";
import { Loader2, Search, TrendingUp, Users, Star, Tv, ChevronLeft, ChevronRight } from "lucide-react";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
  "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
  "Thriller", "Mecha", "Music"
];

const STUDIOS = [
  "MAPPA", "Bones", "Ufotable", "Kyoto Animation", "Madhouse",
  "A-1 Pictures", "Wit Studio", "Trigger"
];

const STATUS_OPTIONS = [
  { value: "", label: "Any Status" },
  { value: "RELEASING", label: "Currently Airing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
];

const SEASON_OPTIONS = [
  { value: "", label: "Any Season" },
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

const FORMAT_OPTIONS = [
  { value: "", label: "Any Format" },
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "Special" },
];

const SORT_OPTIONS = [
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "SCORE_DESC", label: "Rating" },
  { value: "UPDATED_AT_DESC", label: "Recently Updated" },
];

const BROWSE_TABS = [
  { id: "trending", label: "Trending", icon: TrendingUp, sort: "TRENDING_DESC", status: "" },
  { id: "popular", label: "Most Popular", icon: Users, sort: "POPULARITY_DESC", status: "" },
  { id: "airing", label: "Currently Airing", icon: Tv, sort: "POPULARITY_DESC", status: "RELEASING" },
  { id: "airingsoon", label: "Airing Soon", icon: Star, sort: "POPULARITY_DESC", status: "NOT_YET_RELEASED" },
  { id: "toprated", label: "Top Rated", icon: Star, sort: "SCORE_DESC", status: "" },
];

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qParam = searchParams.get("q");
  const sortParam = searchParams.get("sort");

  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const getInitialTab = (param: string | null) => {
    const tab = BROWSE_TABS.find(t => t.id === param);
    return tab ? tab.id : "trending";
  };

  const [searchQuery, setSearchQuery] = useState(qParam || "");
  const [debouncedSearch, setDebouncedSearch] = useState(qParam || "");
  const [selectedTab, setSelectedTab] = useState(getInitialTab(sortParam));
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedSort, setSelectedSort] = useState("POPULARITY_DESC");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStudio, setSelectedStudio] = useState("");
  const [studioSearch, setStudioSearch] = useState("");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Trigger refetch after debounce to get fresh results
      setRefetchTrigger(prev => prev + 1);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const activeTab = BROWSE_TABS.find(t => t.id === selectedTab) || BROWSE_TABS[0];
        const result = await fetchAnimeAction({
          page: currentPage,
          perPage: 30,
          search: debouncedSearch ? debouncedSearch.toLowerCase() : undefined,
          sort: activeTab.sort,
          status: selectedStatus || activeTab.status || undefined,
          format: selectedFormat || undefined,
          season: selectedSeason || undefined,
          seasonYear: selectedYear ? parseInt(selectedYear) : undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          studios: selectedStudio ? [selectedStudio] : undefined,
        });

        if (result && (result.media || result.results) && (result.media?.length > 0 || result.results?.length > 0)) {
          setAnimes(result.media || result.results);
          setHasNextPage(result.pageInfo?.hasNextPage || false);
        } else {
          setAnimes([]);
          setHasNextPage(false);
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [debouncedSearch, currentPage, selectedTab, selectedStatus, selectedSeason, selectedYear, selectedFormat, selectedGenres, selectedStudio, refetchTrigger]);

  useEffect(() => {
    if (qParam && qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
  }, [qParam, searchQuery]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-white">BROWSE </span>
            <span className="text-[#e2a84b]">ANIME</span>
          </h1>
          <p className="text-white/40 text-sm">Explore anime by genre, season, studio & more</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-white/40" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime by title..."
              className="w-full bg-[#111111] border border-white/5 rounded-lg py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#e2a84b] transition-colors"
            />
          </div>
        </form>

        <div className="flex gap-8">
          <aside className="w-[200px] flex-shrink-0">
            <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg overflow-hidden">
              {/* Browse By Section */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-white/40">⊞</span> Browse By
                </h4>
                <div className="space-y-1">
                  {BROWSE_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSelectedTab(tab.id);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded border text-sm transition-all",
                          selectedTab === tab.id
                            ? "bg-[#e2a84b]/10 text-[#e2a84b] border-white/[0.08]"
                            : "text-white/40 hover:text-white/60 bg-[#1a1a1a] border-white/[0.08] hover:border-white/[0.15]"
                        )}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Status</h4>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Season</h4>
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors cursor-pointer"
                >
                  {SEASON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Year</h4>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors cursor-pointer"
                >
                  <option value="">Any Year</option>
                  {YEAR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Format</h4>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors cursor-pointer"
                >
                  {FORMAT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Sort By</h4>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Studio */}
              <div className="p-4 border-b border-white/[0.08]">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Studio</h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {STUDIOS.map(studio => (
                    <button
                      key={studio}
                      onClick={() => {
                        setSelectedStudio(selectedStudio === studio ? "" : studio);
                        setStudioSearch("");
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-2 py-1 bg-[#1a1a1a] border rounded text-[10px] transition-all",
                        selectedStudio === studio
                          ? "border-[#e2a84b] text-[#e2a84b]"
                          : "border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]"
                      )}
                    >
                      {studio}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 text-white/30" size={12} />
                  <input
                    type="text"
                    value={studioSearch}
                    onChange={(e) => {
                      setStudioSearch(e.target.value);
                      setSelectedStudio("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && studioSearch.trim()) {
                        setSelectedStudio(studioSearch.trim());
                        setCurrentPage(1);
                      }
                    }}
                    placeholder="Or type a studio..."
                    className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded pl-7 pr-2 py-1.5 text-xs text-white/60 outline-none focus:border-[#e2a84b]/30 transition-colors placeholder:text-white/30"
                  />
                </div>
              </div>

              {/* Genres */}
              <div className="p-4">
                <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-wider mb-3">Genres</h4>
                <div className="space-y-1">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => {
                        toggleGenre(genre);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 rounded text-sm transition-all",
                        selectedGenres.includes(genre)
                          ? "bg-[#e2a84b]/10 text-[#e2a84b]"
                          : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                      )}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-[#e2a84b] to-transparent" />
                <h3 className="text-xs font-black uppercase text-white/40 tracking-wider">
                  {BROWSE_TABS.find(t => t.id === selectedTab)?.label || "Trending"}
                </h3>
              </div>
              <div className="text-xs text-white/40">
                {animes.length} results
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="animate-spin text-[#e2a84b]" size={40} />
              </div>
            ) : animes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-white/40 text-lg mb-2">No anime found</p>
                <p className="text-white/30 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {animes.map(anime => <BrowseCard key={anime.id} anime={anime} />)}
                </div>

                {(hasNextPage || currentPage > 1) && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 bg-[#1a1a1a] border border-white/[0.08] rounded transition-all",
                        currentPage === 1
                          ? "text-white/20 cursor-not-allowed"
                          : "text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.02]"
                      )}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-[#e2a84b]/10 border border-[#e2a84b]/20 rounded text-[#e2a84b] font-semibold text-sm">
                        {currentPage}
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!hasNextPage}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 bg-[#1a1a1a] border border-white/[0.08] rounded transition-all",
                        !hasNextPage
                          ? "text-white/20 cursor-not-allowed"
                          : "text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.02]"
                      )}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
