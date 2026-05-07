"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("export-container");
      if (!element) {
        console.error("Export container not found");
        return;
      }

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0A0A0A",
      });
      const link = document.createElement("a");
      link.download = "friendcharts-ranking.png";
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error("Failed to export image", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#168853] transition-colors hover:bg-emerald-50 disabled:opacity-70 md:gap-3 md:rounded-2xl md:px-8 md:py-4 md:text-xl"
    >
      {isExporting ? (
        <span>Exporting...</span>
      ) : (
        <>
          <svg className="h-4 w-4 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export
        </>
      )}
    </button>
  );
}
