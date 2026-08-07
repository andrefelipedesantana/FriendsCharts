"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Download, ImageDown } from "lucide-react";

import type { ChartEdition } from "@/lib/chart-edition";
import { chartFileName, downloadDataUrl, exportChartToPng, settleImages } from "@/lib/export-image";
import { ArtistImageUploader } from "@/components/chart/artist-image-uploader";
import { CHART_EXPORT_WIDTH, WeeklyChart } from "@/components/chart/weekly-chart";
import { Modal } from "@/components/ui/modal";

type ExportChartButtonProps = {
  edition: ChartEdition;
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
};

type ExportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export function ExportChartButton({ edition, photo, onPhotoChange }: ExportChartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-signal px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-signal/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <ImageDown className="h-4 w-4" aria-hidden />
        Exportar chart completo
      </button>

      {/* Montado só quando aberto: cada abertura começa com o estado limpo. */}
      {isOpen ? (
        <ExportChartDialog
          onClose={() => setIsOpen(false)}
          edition={edition}
          photo={photo}
          onPhotoChange={onPhotoChange}
        />
      ) : null}
    </>
  );
}

function ExportChartDialog({
  onClose,
  edition,
  photo,
  onPhotoChange,
}: ExportChartButtonProps & { onClose: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [posterHeight, setPosterHeight] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [status, setStatus] = useState<ExportStatus>({ kind: "idle" });

  // A prévia é o próprio nó exportado, apenas reduzido para caber no modal.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const poster = exportRef.current;
    if (!viewport || !poster) return;

    const measure = () => {
      setScale(Math.min(1, viewport.clientWidth / CHART_EXPORT_WIDTH));
      setPosterHeight(poster.offsetHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(poster);

    return () => observer.disconnect();
  }, []);

  // Libera o download quando capas e avatares terminam de carregar. É só um
  // aviso de interface: `exportChartToPng` espera as imagens de novo antes de
  // rasterizar, então trocar a foto não precisa zerar este estado.
  useEffect(() => {
    const poster = exportRef.current;
    if (!poster) return;

    let cancelled = false;

    settleImages(poster).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [photo, edition]);

  const handleExport = useCallback(async () => {
    const poster = exportRef.current;
    if (!poster) return;

    setStatus({ kind: "loading" });

    try {
      const { dataUrl } = await exportChartToPng(poster, { width: CHART_EXPORT_WIDTH });

      downloadDataUrl(dataUrl, chartFileName(edition.period.isoEnd));
      setStatus({ kind: "done" });
    } catch (error) {
      console.error("Falha ao exportar o chart", error);
      setStatus({
        kind: "error",
        message: "Não foi possível gerar a imagem. Tente de novo em alguns segundos.",
      });
    }
  }, [edition.period.isoEnd]);

  const isBusy = status.kind === "loading";
  const canExport = imagesReady && !isBusy;

  const footer = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        aria-live="polite"
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage sm:max-w-[46ch]"
      >
        {status.kind === "error" ? (
          <span className="text-red-300">{status.message}</span>
        ) : status.kind === "loading" ? (
          "Gerando a imagem…"
        ) : status.kind === "done" ? (
          <span className="text-signal">Imagem baixada.</span>
        ) : imagesReady ? (
          `PNG de ${CHART_EXPORT_WIDTH} px de largura, com a edição completa.`
        ) : (
          "Carregando capas e avatares…"
        )}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-sage transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={!canExport}
          className="inline-flex items-center gap-2 bg-signal px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-signal/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          {isBusy ? "Gerando…" : "Baixar imagem"}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Prévia da edição"
      maxWidth="max-w-5xl"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {edition.headliner ? (
          <div className="flex flex-col gap-2 border border-paper/12 bg-sheet/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
              Foto de {edition.headliner.name}
              {photo ? <span className="text-signal"> · escolhida</span> : null}
            </p>
            <ArtistImageUploader
              variant="bar"
              artistName={edition.headliner.name}
              photo={photo}
              onChange={onPhotoChange}
            />
          </div>
        ) : null}

        <div
          ref={viewportRef}
          className="w-full overflow-hidden bg-ink"
          style={{ height: posterHeight ? posterHeight * scale : undefined }}
        >
          <div
            style={{
              width: CHART_EXPORT_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div ref={exportRef} style={{ width: CHART_EXPORT_WIDTH }}>
              <WeeklyChart edition={edition} photo={photo} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
