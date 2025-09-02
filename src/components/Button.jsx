

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus-visible:ring-2";

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-sm px-4 py-2.5",
  };

  
const variants = {
  primary: "brand-gradient text-white shadow-sm hover:opacity-95 focus:ring-indigo-400 dark:focus:ring-indigo-600",
  ghost:   "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800",
  pill:    "bg-[hsl(var(--chip))] text-[hsl(var(--text))] hover:opacity-90 data-[active=true]:bg-[hsl(var(--accent))] data-[active=true]:text-white",

 
  secondary: "bg-[hsl(var(--surface))] text-[hsl(var(--text))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--chip))]"
};

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}