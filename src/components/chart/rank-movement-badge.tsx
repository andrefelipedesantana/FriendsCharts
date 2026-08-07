import { movementLabel, type RankMovement } from "@/lib/rank-movement";
import { cn } from "@/lib/utils";

type RankMovementBadgeProps = {
  movement: RankMovement;
  className?: string;
};

function Triangle({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 10 8"
      aria-hidden
      className="h-[7px] w-[9px] shrink-0"
      fill="currentColor"
      focusable="false"
    >
      {direction === "up" ? <path d="M5 0 10 8H0z" /> : <path d="M5 8 0 0h10z" />}
    </svg>
  );
}

/**
 * Variação de posição frente à semana anterior.
 *
 * Sem histórico não desenha nada — quem avisa é o rótulo da seção, para não
 * repetir "N/D" dez vezes nem sugerir uma variação que não existe.
 */
export function RankMovementBadge({ movement, className }: RankMovementBadgeProps) {
  if (movement.kind === "unknown") return null;

  const label = movementLabel(movement);
  const base = cn(
    "inline-flex shrink-0 items-center justify-end gap-[3px] font-mono text-[10px] font-bold tabular-nums @poster:text-[11px]",
    className
  );

  if (movement.kind === "new") {
    return (
      <span className={cn(base, "justify-end")} title={label}>
        <span className="bg-paper px-[5px] py-[1px] text-[9px] uppercase leading-[1.35] tracking-[0.06em] text-ink @poster:text-[9px]">
          Novo
        </span>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (movement.kind === "same") {
    return (
      <span className={cn(base, "text-sage")} title={label}>
        <span aria-hidden>—</span>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(base, movement.kind === "up" ? "text-signal" : "text-coral")}
      title={label}
    >
      <Triangle direction={movement.kind} />
      {movement.positions}
      <span className="sr-only">{label}</span>
    </span>
  );
}
