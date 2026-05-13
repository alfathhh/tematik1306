import React from "react";
import { KategoriInfra } from "../../types";
import SearchBar from "../search/SearchBar";
import { cn } from "../../lib/cn";

interface PublicHeaderProps {
  kategoriMap: Map<string, KategoriInfra>;
  onToggleFilter: () => void;
  onToggleStatistik: () => void;
  filterActive: boolean;
  statistikActive: boolean;
}

export default function PublicHeader({ kategoriMap, onToggleFilter, onToggleStatistik, filterActive, statistikActive }: PublicHeaderProps) {
  return (
    <header className="glass border-b border-neutral-200/60 px-3 md:px-5 py-2.5 flex items-center gap-3 z-20 flex-shrink-0 shadow-soft">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-soft" role="img" aria-label="Logo">
          <span className="text-white font-display font-bold text-sm leading-none select-none">PP</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-display font-bold text-neutral-900 leading-tight">Peta Tematik</h1>
          <p className="text-[10px] text-neutral-500 leading-tight">Kab. Padang Pariaman</p>
        </div>
      </div>
      <div className="hidden sm:block w-px h-6 bg-neutral-200 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0 flex justify-center">
        <SearchBar kategoriMap={kategoriMap} />
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button type="button" onClick={onToggleFilter} aria-label="Toggle filter" aria-pressed={filterActive}
          className={cn("inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium transition-colors duration-250 focus:outline-none focus-visible:shadow-focus", filterActive ? "bg-primary-50 text-primary-600 border border-primary-200" : "text-neutral-600 hover:bg-neutral-100 border border-transparent")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="hidden md:inline text-xs">Filter</span>
        </button>
        <button type="button" onClick={onToggleStatistik} aria-label="Toggle statistik" aria-pressed={statistikActive}
          className={cn("inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium transition-colors duration-250 focus:outline-none focus-visible:shadow-focus", statistikActive ? "bg-primary-50 text-primary-600 border border-primary-200" : "text-neutral-600 hover:bg-neutral-100 border border-transparent")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="hidden md:inline text-xs">Statistik</span>
        </button>
      </div>
    </header>
  );
}
