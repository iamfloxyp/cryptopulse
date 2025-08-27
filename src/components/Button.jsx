export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-2.5",
  };
  const variants = {
    primary:
      "brand-gradient text-white shadow-sm hover:opacity-95 focus:ring-indigo-400 dark:focus:ring-indigo-600",
    ghost:
      "border border-zinc-300 dark:border-zinc-700 !bg-zinc-200 !text-black  hover:!bg-zinc-300 dark:!bg-zinc-700 dark:!text-white dark:hover: !bg-zinc-600",
    subtle:
      "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}