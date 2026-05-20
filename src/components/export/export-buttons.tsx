"use client";

import React, { useState } from "react";
import { ExportTop10Modal } from "./export-top-10-modal";
import { ExportOthersModal } from "./export-others-modal";
import { Artist, Track, Album, User } from "@/types/lastfm-types";

type ExportButtonsProps = {
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  listeners: User[];
  totalPlays: number;
  dateRange: string;
};

export function ExportButtons({ artists, tracks, albums, listeners, totalPlays, dateRange }: ExportButtonsProps) {
  const [isTop10Open, setIsTop10Open] = useState(false);
  const [isOthersOpen, setIsOthersOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        onClick={() => setIsTop10Open(true)}
        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#168853] transition-colors hover:bg-emerald-50 md:rounded-2xl md:px-6 md:py-3 md:text-base"
      >
        <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Exportar Top 10 Artistas
      </button>

      <button
        onClick={() => setIsOthersOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20 md:rounded-2xl md:px-6 md:py-3 md:text-base border border-white/20"
      >
        <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Exportar Demais
      </button>

      <ExportTop10Modal
        isOpen={isTop10Open}
        onClose={() => setIsTop10Open(false)}
        artists={artists}
        dateRange={dateRange}
      />

      <ExportOthersModal
        isOpen={isOthersOpen}
        onClose={() => setIsOthersOpen(false)}
        tracks={tracks}
        albums={albums}
        listeners={listeners}
        totalPlays={totalPlays}
        dateRange={dateRange}
      />
    </div>
  );
}
