
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
  label,
  value,
  direction = "up",
  active = false,
  onClick,
  iconColor = "hsl(var(--accent))",
}) {
  const DirIcon = direction === "up" ? TrendingUp : TrendingDown;

  return (
    <button
      onClick={onClick}
      className={[
        "glass w-full h-full text-left rounded-lg",
        "p-5 md:p-6",                         // roomy padding
        "transition hover:scale-[1.01]",      // subtle hover
        active ? "kpi-active ring-1 ring-[hsl(var(--brand-from)/.25)]" : ""
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] md:text-xs uppercase tracking-wide text-[hsl(var(--text))]/70">
          {label}
        </div>
        <DirIcon size={16} style={{ color: iconColor }} />
      </div>

      <div className="text-2xl md:text-3xl font-semibold mt-1 leading-tight">
        {value}
      </div>
    </button>
  );
}