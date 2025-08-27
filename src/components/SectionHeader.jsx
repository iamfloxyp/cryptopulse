export default function SectionHeader({ title, children, aside }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {children ? <p className="text-sm text-black dark: text-gray-300">{children}</p> : null}
      </div>
      <div className="flex items-center gap-2">{aside}</div>
    </div>
  );
}