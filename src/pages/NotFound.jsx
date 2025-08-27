export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">404</h1>
        <p className="opacity-70 mb-4">Page not found.</p>
        <a href="/" className="underline">Back to Dashboard</a>
      </div>
    </main>
  );
}