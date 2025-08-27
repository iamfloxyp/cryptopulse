import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({ label, value, direction = "up", active = false, onClick }) {
  const DirIcon = direction === "up" ? TrendingUp : TrendingDown;
  const dirColor = direction === "up" ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]";
  return (
    <button
      onClick={onClick}
      className={`text-left glass p-4 transition hover:scale-[1.01] ${active ? "kpi-active" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-[hsl(var(--text))">{label}</div>
        <DirIcon size={16} className={dirColor} />
      </div>
      <div className="text-xl md:text-2xl font-semibold mt-1 text-inherit">{value}</div>
    </button>
  );
}