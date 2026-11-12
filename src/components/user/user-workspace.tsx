"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { Download, Share2 } from "lucide-react";

import { ArtistImageUploader } from "@/components/chart/artist-image-uploader";
import { downloadDataUrl, exportChartToPng, settleImages } from "@/lib/export-image";
import type { UserEdition } from "@/lib/user-edition";
import { cn } from "@/lib/utils";
import { GroupStory } from "./group-story";
import { SoloStory } from "./solo-story";
import { STORY_HEIGHT, STORY_WIDTH } from "./story-parts";

export type StoryMode = "grupo" | "solo";

const MODES: Array<{ id: StoryMode; label: string; hint: string }> = [
  { id: "solo", label: "Só eu", hint: "Seu chart pessoal, sem dados do grupo." },
  { id: "grupo", label: "No grupo", hint: "Sua posição, afinidades e peso no chart do grupo." },
];

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

function fileNameFor(user: string, mode: StoryMode, isoEnd: string) {
  return `friendcharts-${user.toLowerCase()}-${mode}-${isoEnd}.png`;
}

/** Menu nativo de compartilhar com arquivo (celular) — leva direto ao Instagram. */
function supportsFileShare() {
  try {
    const probe = new File([""], "probe.png", { type: "image/png" });
    return Boolean(navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

async function dataUrlToFile(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: "image/png" });
}

export function UserWorkspace({
  edition,
  initialMode,
}: {
  edition: UserEdition;
  initialMode: StoryMode;
}) {
  const [mode, setMode] = useState<StoryMode>(initialMode);
  const [photo, setPhoto] = useState<string | null>(null);
  const [scale, setScale] = useState(0.3);
  const [imagesReady, setImagesReady] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const canShare = useSyncExternalStore(noopSubscribe, supportsFileShare, () => false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const { solo } = edition;

  // Mantém o modo na URL para o link poder ser compartilhado já no modo certo.
  const changeMode = (next: StoryMode) => {
    setMode(next);
    setStatus({ kind: "idle" });
    const url = new URL(window.location.href);
    url.searchParams.set("modo", next);
    window.history.replaceState(null, "", url);
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => setScale(Math.min(1, viewport.clientWidth / STORY_WIDTH));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = storyRef.current;
    if (!node) return;

    let cancelled = false;
    setImagesReady(false);
    settleImages(node).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [mode, photo]);

  const render = useCallback(async () => {
    const node = storyRef.current;
    if (!node) throw new Error("Story não montado");
    const { dataUrl } = await exportChartToPng(node, { width: STORY_WIDTH, pixelRatio: 1 });
    return dataUrl;
  }, []);

  const fileName = fileNameFor(solo.user, mode, solo.period.isoEnd);

  const handleDownload = async () => {
    setStatus({ kind: "loading" });
    try {
      downloadDataUrl(await render(), fileName);
      setStatus({ kind: "done", message: "Imagem baixada." });
    } catch (error) {
      console.error(error);
      setStatus({ kind: "error", message: "Não foi possível gerar a imagem. Tente de novo." });
    }
  };

  const handleShare = async () => {
    setStatus({ kind: "loading" });
    try {
      const file = await dataUrlToFile(await render(), fileName);
      await navigator.share({ files: [file] });
      setStatus({ kind: "idle" });
    } catch (error) {
      // Cancelar o menu de compartilhamento não é erro.
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus({ kind: "idle" });
        return;
      }
      console.error(error);
      setStatus({ kind: "error", message: "Não deu para compartilhar. Use “Baixar imagem”." });
    }
  };

  const isBusy = status.kind === "loading";
  const disabled = !imagesReady || isBusy;
  const buttonBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/u"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage hover:text-paper"
        >
          ← Trocar usuário
        </Link>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage hover:text-paper"
        >
          Chart do grupo →
        </Link>
      </div>

      <div role="tablist" aria-label="Modo do chart" className="grid grid-cols-2 gap-1 bg-sheet p-1">
        {MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={mode === option.id}
            onClick={() => changeMode(option.id)}
            className={cn(
              "px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
              mode === option.id ? "bg-signal text-ink" : "text-sage hover:text-paper"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
        {MODES.find((option) => option.id === mode)?.hint}
      </p>

      {!solo.hasHistory && !solo.isEmpty ? (
        <p className="border border-amber-300/40 bg-amber-300/10 p-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-amber-200">
          O Last.fm não devolveu sua semana passada agora, então a imagem sai sem as setas de
          subiu/desceu. Tente de novo em alguns minutos.
        </p>
      ) : null}

      {mode === "solo" && solo.topArtist ? (
        <div className="flex flex-col gap-2 border border-paper/12 bg-sheet/50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
            Foto de {solo.topArtist.name}
            {photo ? <span className="text-signal"> · escolhida</span> : null}
          </p>
          <ArtistImageUploader
            variant="bar"
            artistName={solo.topArtist.name}
            photo={photo}
            onChange={setPhoto}
          />
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className="mx-auto w-full max-w-[420px] overflow-hidden border border-paper/10 bg-ink shadow-[0_24px_80px_-40px_rgba(0,229,143,0.35)]"
        style={{ height: STORY_HEIGHT * scale }}
      >
        <div style={{ width: STORY_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div ref={storyRef} style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}>
            {mode === "solo" ? (
              <SoloStory edition={solo} photo={photo} />
            ) : (
              <GroupStory edition={edition} />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-2">
        <div className={cn("grid gap-2", canShare ? "grid-cols-2" : "grid-cols-1")}>
          {canShare ? (
            <button
              type="button"
              onClick={handleShare}
              disabled={disabled}
              className={cn(buttonBase, "bg-signal text-ink hover:bg-signal/85")}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Compartilhar
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDownload}
            disabled={disabled}
            className={cn(
              buttonBase,
              canShare
                ? "border border-paper/20 text-paper hover:border-paper/40"
                : "bg-signal text-ink hover:bg-signal/85"
            )}
          >
            <Download className="h-4 w-4" aria-hidden />
            {isBusy ? "Gerando…" : "Baixar imagem"}
          </button>
        </div>
        <p aria-live="polite" className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-sage">
          {status.kind === "error" ? (
            <span className="text-red-300">{status.message}</span>
          ) : status.kind === "done" ? (
            <span className="text-signal">{status.message}</span>
          ) : isBusy ? (
            "Gerando a imagem…"
          ) : imagesReady ? (
            `Story ${STORY_WIDTH}×${STORY_HEIGHT}, pronto para o Instagram.`
          ) : (
            "Carregando capas e avatares…"
          )}
        </p>
      </div>
    </div>
  );
}
