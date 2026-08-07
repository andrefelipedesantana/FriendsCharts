import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  meta?: string;
  className?: string;
  id?: string;
};

/** Filete + rótulo em mono: o divisor de seção de toda a edição. */
export function SectionHeading({ title, meta, className, id }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3 border-t border-paper/15 pt-2 pb-2.5 @poster:pt-2.5 @poster:pb-3",
        className
      )}
    >
      <h2
        id={id}
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-paper @poster:text-[11px]"
      >
        {title}
      </h2>
      {meta ? (
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-sage @poster:text-[10px]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

/** Estado vazio de seção — mantém a altura da peça previsível. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-paper/15 px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-sage">
      {children}
    </p>
  );
}
