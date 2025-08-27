import  {useLocal}  from '../store/useLocal';

export default function Settings() {
  const [currency, setCurrency] = useLocal('currency', 'usd');
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <section className="rounded border dark:border-zinc-800 p-4 space-y-3">
        <h2 className="font-medium">Currency</h2>
        <select value={currency} onChange={(e)=>setCurrency(e.target.value)}
                className="rounded border dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="gbp">GBP</option>
          <option value="ngn">NGN</option>
        </select>
      </section>
    </main>
  );
}