"use client";

import React, { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

type ArtistImageUploaderProps = {
  artistName: string;
  photo: string | null;
  onChange: (photo: string | null) => void;
  /** `overlay` fica sobre o retrato; `bar` é a linha de controle do modal. */
  variant?: "overlay" | "bar";
  className?: string;
};

/**
 * Escolhe a foto do artista Nº 1. A imagem vira data URL, então acompanha o
 * componente na prévia e na exportação sem depender de rede.
 *
 * `data-export-hide` remove estes controles do PNG — a foto em si continua,
 * porque quem a desenha é o retrato do destaque, não este componente.
 */
export function ArtistImageUploader({
  artistName,
  photo,
  onChange,
  variant = "overlay",
  className,
}: ArtistImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const isOverlay = variant === "overlay";

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permite reescolher o mesmo arquivo depois de remover.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem precisa ter até 8 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => setError("Não foi possível ler essa imagem. Tente outra.");
    reader.readAsDataURL(file);
  };

  const buttonBase =
    "inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

  return (
    <div
      data-export-hide=""
      className={cn(
        isOverlay
          ? "absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-2.5"
          : "flex flex-wrap items-center gap-2",
        className
      )}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          buttonBase,
          "px-2.5 py-1.5",
          isOverlay
            ? "bg-ink/85 text-paper hover:bg-ink"
            : "bg-signal text-ink hover:bg-signal/85"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.6" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        {photo ? "Trocar foto" : "Adicionar foto"}
        <span className="sr-only"> de {artistName}</span>
      </button>

      {photo ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            onChange(null);
          }}
          className={cn(
            buttonBase,
            "px-2.5 py-1.5",
            isOverlay
              ? "bg-ink/85 text-sage hover:bg-ink hover:text-paper"
              : "border border-paper/20 text-sage hover:border-paper/40 hover:text-paper"
          )}
        >
          Remover
          <span className="sr-only"> foto de {artistName}</span>
        </button>
      ) : (
        <p
          className={cn(
            "font-mono text-[9px] uppercase tracking-[0.14em]",
            isOverlay ? "hidden text-paper/70 @chart:block" : "text-sage"
          )}
        >
          Opcional
        </p>
      )}

      {error ? (
        <p role="alert" className="w-full font-mono text-[10px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
