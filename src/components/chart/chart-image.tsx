"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

type ChartImageProps = {
  src?: string;
  alt: string;
  className?: string;
  /** Desenhado quando não há `src` ou o carregamento falha. Nunca fica vazio. */
  fallback: React.ReactNode;
  /** Marca a imagem para a varredura de prontidão antes da exportação. */
  wrapperClassName?: string;
};

/**
 * `<img>` cru (e não `next/image`) de propósito: a exportação clona o DOM e
 * precisa de um `src` previsível e legível por CORS. Last.fm e DiceBear
 * respondem `Access-Control-Allow-Origin: *`, então `crossOrigin` basta.
 */
export function ChartImage({ src, alt, className, fallback, wrapperClassName }: ChartImageProps) {
  // Trocar a foto precisa limpar o estado de erro; ajustar durante o render
  // evita o ciclo extra de um efeito.
  const [attempt, setAttempt] = useState<{ src?: string; failed: boolean }>({ src, failed: false });
  if (attempt.src !== src) setAttempt({ src, failed: false });

  const failed = attempt.failed;

  if (!src || failed) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", wrapperClassName)}>
        {fallback}
      </div>
    );
  }

  const isDataUrl = src.startsWith("data:");

  // `next/image` reescreve src/srcset e quebraria a clonagem do DOM feita na
  // exportação, que precisa de um src estável e legível por CORS.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      // A marcação vem do servidor: uma imagem pode falhar antes da hidratação
      // e nesse caso `onError` nunca dispara. Checar no commit cobre o buraco.
      ref={(node) => {
        if (node?.complete && node.naturalWidth === 0) {
          setAttempt({ src, failed: true });
        }
      }}
      src={src}
      alt={alt}
      data-chart-image=""
      loading="eager"
      decoding="sync"
      crossOrigin={isDataUrl ? undefined : "anonymous"}
      referrerPolicy="no-referrer"
      onError={() => setAttempt({ src, failed: true })}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

/** Bloco tipográfico usado quando falta capa/avatar/foto. */
export function ImageFallback({
  label,
  className,
  size = "md",
}: {
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = {
    sm: "text-[9px] tracking-[0.1em]",
    md: "text-sm tracking-[0.08em]",
    lg: "text-3xl tracking-[0.06em]",
  }[size];

  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center bg-brand/15 font-mono font-bold text-signal/70",
        scale,
        className
      )}
    >
      {label}
    </div>
  );
}
