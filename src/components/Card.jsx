export default function Card({ className = "", children }) {
  return (
    <div className={`glass text-black dark:text-white ${className}`}>
      {children}
    </div>
  );
}