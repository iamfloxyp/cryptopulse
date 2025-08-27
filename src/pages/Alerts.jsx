// src/pages/Alerts.jsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../store/useAuth';
import { useLocal } from '../store/useLocal';
import { useAlerts } from '../store/useAlerts';
import { getSpot } from '../services/price';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';

export default function Alerts() {
  const { isAuthed } = useAuth();
  const [currency] = useLocal('currency', 'usd');

  // ---- form state
  const [coinId, setCoinId] = useState('bitcoin');
  const [direction, setDirection] = useState('above'); // 'above' | 'below'
  const [price, setPrice] = useState('');

  // ---- alerts store
  const { rules, add, remove, toggle, markTriggered } = useAlerts();

  // ------------------------------------------------------------------
  // TOP 100 COINS + SIMPLE SEARCH
  // ------------------------------------------------------------------
  const [markets, setMarkets] = useState([]); // [{id, name, symbol}]
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url =
          `https://api.coingecko.com/api/v3/coins/markets` +
          `?vs_currency=${currency}` +
          `&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (!alive) return;
        setMarkets(
          (Array.isArray(data) ? data : []).map(c => ({
            id: c.id,
            name: c.name,
            symbol: (c.symbol || '').toUpperCase(),
          }))
        );
      } catch {
        setMarkets([]);
      }
    })();
    return () => { alive = false; };
  }, [currency]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return markets;
    return markets.filter(c =>
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [markets, query]);

  // ------------------------------------------------------------------
  // CREATE RULE
  // ------------------------------------------------------------------
  function onCreate(e) {
    e.preventDefault();
    const p = Number(price);
    if (!coinId || Number.isNaN(p) || p <= 0) return;
    add({ coinId, direction, price: p, currency });
    setPrice('');
  }

  // ------------------------------------------------------------------
  // POLLER: check active rules every 60s
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!rules.length) return;
    let stop = false;

    async function tick() {
      try {
        const active = rules.filter(r => r.active);
        const byCoin = [...new Set(active.map(r => r.coinId))];

        const prices = {};
        await Promise.all(
          byCoin.map(async id => {
            prices[id] = await getSpot({ id, vsCurrency: currency });
          })
        );

        active.forEach(r => {
          const spot = prices[r.coinId];
          if (Number.isNaN(spot)) return;
          const hit = r.direction === 'above' ? spot >= r.price : spot <= r.price;
          if (hit) markTriggered(r.id);
        });
      } catch {}
      if (!stop) timer = setTimeout(tick, 60000);
    }

    let timer = setTimeout(tick, 0);
    return () => { stop = true; clearTimeout(timer); };
  }, [rules, currency, markTriggered]);

  // ------------------------------------------------------------------
  // GATE: require auth to create/view alerts
  // ------------------------------------------------------------------
  if (!isAuthed) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-4">
          <SectionHeader title="Alerts">Create price alerts (coming next)</SectionHeader>
          <p className="text-sm">Please log in to create alerts.</p>
        </Card>
      </main>
    );
  }

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Create alert */}
      <Card className="p-4">
        <SectionHeader title="Create alert">When price crosses your target.</SectionHeader>

        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-2 items-center">
          {/* Search + collapsed dropdown */}
          <div className="md:col-span-2 space-y-2">
            <input
              className="input h-10 text-sm"
              placeholder="Search coin (e.g., btc, ether, sol…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input h-10 text-sm"
              value={coinId}
              onChange={(e) => setCoinId(e.target.value)}
            >
              {filtered.map(c => (
                <option key={c.id} value={c.id}>
                  {c.symbol} — {c.name}
                </option>
              ))}
            </select>
            
          </div>

          {/* Condition */}
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="input h-10 text-sm"
            title="Condition"
          >
            <option value="above">goes above</option>
            <option value="below">goes below</option>
          </select>

          {/* Target price */}
          <input
            type="number"
            placeholder={`Target price (${currency.toUpperCase()})`}
            className="input h-10 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />

          <div className="md:col-span-4">
            <Button type="submit">Add alert</Button>
          </div>
        </form>
      </Card>

      {/* List alerts */}
      <Card className="p-4">
        <SectionHeader title="Your alerts">
          Click toggle to enable/disable. Triggered alerts get a timestamp.
        </SectionHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-white  dark:bg-zinc-100 dark:text-zinc-900">
              <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold">
                <th>Coin</th><th>Condition</th><th>Status</th><th>Triggered</th><th></th>
              </tr>
            </thead>
            <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2 text- white dark:text-zinc-900">
              {rules.length === 0 ? (
                <tr className='bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'>
                  <td colSpan={5} className="text-center py-8 text-muted">No alerts yet.</td>
                </tr>
              ) : rules.map(r => (
                <tr key={r.id} className="border-t dark:border-zinc-800">
                  <td className="uppercase">{r.coinId}</td>
                  <td>
                    {r.direction} {r.price.toLocaleString()} {r.currency.toUpperCase()}
                  </td>
                  <td>
                    <button
                      className={`px-2 py-1 rounded text-xs ${r.active ? 'brand-gradient text-white' : 'border border-zinc-300 dark:border-zinc-700'}`}
                      onClick={() => toggle(r.id)}
                    >
                      {r.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className={r.triggeredAt ? '' : 'text-muted'}>
                    {r.triggeredAt ? new Date(r.triggeredAt).toLocaleString() : '—'}
                  </td>
                  <td className="text-right">
                    <button className="text-red-500 hover:underline" onClick={() => remove(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}