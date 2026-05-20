"use client";

import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Download, XCircle } from "lucide-react";

import { Track, Album, User } from "@/types/lastfm-types";

type ExportOthersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  albums: Album[];
  listeners: User[];
  totalPlays: number;
  dateRange: string;
};

export function ExportOthersModal({ isOpen, onClose, tracks, albums, listeners, totalPlays, dateRange }: ExportOthersModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const topTracks = tracks.slice(0, 3);
  const topAlbum = albums[0];

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0A0A0A",
      });
      const link = document.createElement("a");
      link.download = "friendcharts-others.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export image", error);
    } finally {
      setIsExporting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-4">
      <button 
        onClick={onClose} 
        disabled={isExporting} 
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        <XCircle className="h-4 w-4" /> Cancelar
      </button>
      <Button onClick={handleExport} disabled={isExporting} className="bg-[#168853] text-white hover:bg-[#168853]/90">
        {isExporting ? "Exportando..." : (
          <>
            <Download className="mr-2 h-4 w-4" /> Confirmar Download
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Demais Rankings" maxWidth="max-w-4xl" footer={footer}>
      <div className="flex flex-col gap-6">
        <p className="text-sm text-zinc-400">
          Esta é uma prévia da imagem que será exportada.
        </p>

        <div className="w-full bg-[#0A0A0A] p-6 sm:p-8 rounded-3xl border border-white/10 text-white" style={{ fontFamily: "sans-serif" }}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#168853] p-6 shadow-xl">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                </div>
                <span className="text-sm font-bold tracking-widest text-white/90">FRIENDCHARTS</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Outros Destaques</h1>
              <p className="mt-1 text-sm font-medium text-emerald-100 capitalize">{dateRange}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl bg-[#121212] p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Top Músicas</h2>
              <div className="space-y-4">
                {topTracks.map((track) => (
                  <div key={`${track.name}-${track.artist}`} className="flex flex-col justify-center rounded-xl border border-zinc-800/50 bg-[#1A1A1A] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="pr-2 text-sm">
                        <h3 className="font-bold text-white leading-tight">{track.name}</h3>
                        <p className="mt-0.5 text-xs font-medium text-[#00E58F]">{track.artist || "Unknown Artist"}</p>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-bold text-white">
                        {track.playcount}x
                      </div>
                    </div>
                    {track.topListener && (
                      <div className="self-end rounded-full border border-zinc-800/50 bg-black/40 px-2 py-0.5">
                        <span className="text-[10px] font-bold text-zinc-300">top ouvinte: {track.topListener}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {topAlbum && (
                <div className="rounded-2xl bg-[#121212] p-6 shadow-xl">
                  <h2 className="mb-4 text-2xl font-bold text-white">Top Album</h2>
                  <div className="flex gap-4 items-center">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      {topAlbum.image ? (
                        <img
                          src={topAlbum.image}
                          alt={topAlbum.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">
                        {topAlbum.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">
                        {topAlbum.artist || "Unknown Artist"}
                      </p>
                      {topAlbum.topListener && (
                        <div className="mt-2 inline-block rounded-full bg-black/80 px-2 py-0.5">
                          <span className="text-[10px] font-bold text-white">top: {topAlbum.topListener}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-2xl bg-[#121212] p-6 shadow-xl">
                <h2 className="mb-4 text-2xl font-bold text-white">Top Ouvintes</h2>
                <div className="space-y-4">
                  {listeners.slice(0, 3).map((user, index) => {
                    const percentage = user.percentage || 0;
                    return (
                      <div key={user.user} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                              <img src={user.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user}`} alt={user.user} className="w-full h-full object-cover" crossOrigin="anonymous" />
                            </div>
                            {index === 0 && (
                              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#168853] text-[8px] font-bold text-white shadow-md">
                                1º
                              </div>
                            )}
                            {index === 1 && (
                              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-600 text-[8px] font-bold text-white shadow-md">
                                2º
                              </div>
                            )}
                            {index === 2 && (
                              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[8px] font-bold text-white shadow-md">
                                3º
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white leading-tight">
                              {user.user}
                            </h3>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              {user.playcount} plays
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-[#00E58F]">
                            {percentage}%
                          </div>
                          <div className="text-[8px] font-bold tracking-widest text-zinc-500">
                            DO TOTAL
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute pointer-events-none opacity-0" style={{ left: "-9999px", top: "-9999px" }}>
          <div 
            ref={exportRef} 
            className="w-[800px] bg-[#0A0A0A] p-12 text-white" 
            style={{ fontFamily: "sans-serif" }}
          >
            <div className="mb-10 flex items-center justify-between rounded-[32px] bg-[#168853] p-10 shadow-2xl">
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  </div>
                  <span className="text-xl font-bold tracking-widest text-white/90">FRIENDCHARTS</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Outros Destaques</h1>
                <p className="mt-2 text-xl font-medium text-emerald-100 capitalize">{dateRange}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-start">
              <div className="rounded-[32px] bg-[#121212] p-8 shadow-xl">
                <h2 className="mb-8 text-3xl font-bold text-white">Top Tracks</h2>
                <div className="space-y-6">
                  {topTracks.map((track) => (
                    <div key={`${track.name}-${track.artist}`} className="flex flex-col justify-center rounded-2xl border border-zinc-800/50 bg-[#1A1A1A] p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="pr-2">
                          <h3 className="text-xl font-bold text-white leading-tight">{track.name}</h3>
                          <p className="mt-1 text-base font-medium text-[#00E58F]">{track.artist || "Unknown Artist"}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-1 text-base font-bold text-white">
                          {track.playcount}x
                        </div>
                      </div>
                      {track.topListener && (
                        <div className="self-end rounded-full border border-zinc-800/50 bg-black/40 px-3 py-1">
                          <span className="text-xs font-bold text-zinc-300">top ouvinte: {track.topListener}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {topAlbum && (
                  <div className="rounded-[32px] bg-[#121212] p-8 shadow-xl">
                    <h2 className="mb-8 text-3xl font-bold text-white">Top Album</h2>
                    <div className="relative overflow-hidden rounded-[24px]">
                      {topAlbum.image ? (
                        <img
                          src={topAlbum.image}
                          alt={topAlbum.name}
                          className="aspect-square w-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-zinc-800" />
                      )}
                      {topAlbum.topListener && (
                        <div className="absolute right-4 top-4 z-10 rounded-full bg-black/80 px-4 py-2 backdrop-blur-md">
                          <span className="text-xs font-bold text-white">top ouvinte: {topAlbum.topListener}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-xl font-bold leading-tight text-white line-clamp-1">
                        {topAlbum.name}
                      </h3>
                      <p className="mt-1 text-base font-medium text-zinc-400 line-clamp-1">
                        {topAlbum.artist || "Unknown Artist"}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="rounded-[32px] bg-[#121212] p-8 shadow-xl">
                  <h2 className="mb-6 text-3xl font-bold text-white">Top Ouvintes</h2>
                  <div className="space-y-6">
                    {listeners.slice(0, 3).map((user, index) => {
                      const percentage = user.percentage || 0;
                      return (
                        <div key={user.user} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="flex h-14 w-14 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                                <img src={user.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user}`} alt={user.user} className="w-full h-full object-cover" crossOrigin="anonymous" />
                              </div>
                              {index === 0 && (
                                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#168853] text-[10px] font-bold text-white shadow-md">
                                  1º
                                </div>
                              )}
                              {index === 1 && (
                                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-[10px] font-bold text-white shadow-md">
                                  2º
                                </div>
                              )}
                              {index === 2 && (
                                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-md">
                                  3º
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {user.user}
                              </h3>
                              <p className="mt-0.5 text-sm font-medium text-zinc-400">
                                {user.playcount} plays
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-black text-[#00E58F]">
                              {percentage}%
                            </div>
                            <div className="mt-1 text-[10px] font-bold tracking-widest text-zinc-500">
                              DO TOTAL
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
        </div>
      </div>
    </div>
  </div>
</Modal>
  );
}
