"use client";

import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { ImagePlus, Download, XCircle } from "lucide-react";
import { Artist } from "@/types/lastfm-types";

type ArtistLocal = {
  name: string;
  playcount: number;
  topListener?: string;
};

type ExportTop10ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artists: ArtistLocal[];
  dateRange: string;
};

export function ExportTop10Modal({ isOpen, onClose, artists, dateRange }: ExportTop10ModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const top10Artists = artists.slice(0, 10);
  const maxPlays = top10Artists.length > 0 ? Math.max(...top10Artists.map((a) => a.playcount)) : 1;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

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
      link.download = "friendcharts-top10.png";
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
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Top 10 Artistas" maxWidth="max-w-4xl" footer={footer}>
      <div className="flex flex-col gap-6">
        <p className="text-sm text-zinc-400">
          Esta é uma prévia da imagem. Você pode clicar no quadro pontilhado para adicionar ou alterar a foto ao lado do ranking.
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
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Top 10 Artistas</h1>
              <p className="mt-1 text-sm font-medium text-emerald-100 capitalize">{dateRange}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
            <div className="rounded-2xl bg-[#121212] p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                {top10Artists.map((artist, index) => {
                  const percentage = Math.max((artist.playcount / maxPlays) * 100, 2);
                  const position = index + 1;
                  return (
                    <div key={artist.name} className="flex items-center gap-3">
                      <div className="flex w-6 justify-center text-sm font-bold text-zinc-500">
                        {position === 1 ? '🏆' : position === 2 ? '🥈' : position === 3 ? '🥉' : position}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-zinc-100 truncate pr-4">{artist.name}</span>
                          <span className="font-bold text-[#00E58F]">{artist.playcount}x</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 rounded-full bg-zinc-800/50">
                            <div className="h-full rounded-full bg-[#00E58F]" style={{ width: `${percentage}%` }} />
                          </div>
                          {artist.topListener && (
                            <div className="flex items-center gap-2 rounded-full border border-zinc-800/50 bg-black/40 px-1.5 py-0.5">
                              <span className="text-[10px] font-bold text-zinc-300 truncate max-w-[80px]">{artist.topListener}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-[#121212] p-4 shadow-xl flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
              {uploadedImage ? (
                <div 
                  className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden group cursor-pointer"
                  onClick={triggerUpload}
                >
                  <img src={uploadedImage} alt="User upload" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Alterar Foto</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-full min-h-[300px] rounded-xl border-2 border-dashed border-zinc-700/50 flex flex-col items-center justify-center cursor-pointer hover:border-[#168853]/50 hover:bg-[#168853]/5 transition-all p-4"
                  onClick={triggerUpload}
                >
                  <div className="bg-zinc-800 p-3 rounded-full mb-3 text-zinc-400">
                    <ImagePlus size={32} />
                  </div>
                  <h3 className="text-base font-bold text-zinc-300 mb-1">Adicionar Foto</h3>
                  <p className="text-zinc-500 text-center px-4 text-xs">Clique para escolher uma foto</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        <div className="absolute pointer-events-none opacity-0" style={{ left: "-9999px", top: "-9999px" }}>
          <div 
            ref={exportRef} 
            className="w-[1080px] bg-[#0A0A0A] p-12 text-white" 
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
                <h1 className="text-5xl font-extrabold tracking-tight text-white">Top 10 Artistas</h1>
                <p className="mt-2 text-xl font-medium text-emerald-100 capitalize">{dateRange}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
              <div className="rounded-[32px] bg-[#121212] p-10 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  {top10Artists.map((artist, index) => {
                    const percentage = Math.max((artist.playcount / maxPlays) * 100, 2);
                    const position = index + 1;
                    return (
                      <div key={artist.name} className="flex items-center gap-4">
                        <div className="flex w-8 justify-center text-xl font-bold text-zinc-500">
                          {position === 1 ? '🏆' : position === 2 ? '🥈' : position === 3 ? '🥉' : position}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-zinc-100 truncate pr-4">{artist.name}</span>
                            <span className="text-lg font-bold text-[#00E58F]">{artist.playcount}x</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="h-2 flex-1 rounded-full bg-zinc-800/50">
                              <div className="h-full rounded-full bg-[#00E58F]" style={{ width: `${percentage}%` }} />
                            </div>
                            {artist.topListener && (
                              <div className="flex items-center gap-2 rounded-full border border-zinc-800/50 bg-black/40 px-2 py-0.5">
                                <span className="text-xs font-bold text-zinc-300 truncate max-w-[100px]">{artist.topListener}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[32px] bg-[#121212] p-6 shadow-xl flex flex-col items-center justify-center min-h-[500px]">
                {uploadedImage ? (
                  <div className="relative w-full h-[520px] rounded-[24px] overflow-hidden">
                    <img src={uploadedImage} alt="User upload" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-[520px] rounded-[24px] border-4 border-dashed border-zinc-700/50 flex flex-col items-center justify-center p-4">
                    <div className="bg-zinc-800 p-4 rounded-full mb-4 text-zinc-400">
                      <ImagePlus size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">Sem Foto</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
