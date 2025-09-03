// src/pages/Alerts.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useLocal } from '../store/useLocal';
import { useAlerts } from '../store/useAlerts';
import { getSpot } from '../services/coingecko';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';

export default function Alerts() {
  const { isAuthed } = useAuth();
  const location = useLocation();

  
  const [currency] = useLocal('currency', 'usd');
  const [density]  = useLocal('density', 'comfortable'); 
  const cellPad    = density === 'compact' ? 'py-1 px-2' : 'py-2 px-3';

  
  const [coinId, setCoinId] = useState('bitcoin');
  const [direction, setDirection] = useState('above');
  const [price, setPrice] = useState('');

  
  const { rules, add, remove, toggle, markTriggered } = useAlerts();

  // -----------------------------
  // Top coins + search (paged fetch)
  // -----------------------------
  const [markets, setMarkets] = useState([]); 
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const perPage = 250;   
        const maxPages = 2;    
        let all = [];

        for (let page = 1; page <= maxPages; page++) {
          const url =
            `https://api.coingecko.com/api/v3/coins/markets` +
            `?vs_currency=${currency}` +
            `&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;

          const res = await fetch(url);
          if (!res.ok) break; 
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) break;

          all = all.concat(data);

          if (data.length < perPage) break; 
        }

        if (!alive) return;

        
        setMarkets(
          all.map(c => ({
            id: c.id,
            name: c.name,
            symbol: (c.symbol || '').toUpperCase(),
          }))
        );
      } catch {
        if (alive) setMarkets([]);
      }
    })();

    return () => { alive = false; };
  }, [currency]);

  // sort by market name then filter by query; limit options shown to 200 to keep select usable
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...markets].sort((a, b) => a.name.localeCompare(b.name));
    const list = q
      ? base.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      : base;
    return list.slice(0, 200);
  }, [markets, query]);

  // -----------------------------
  // Live spot preview for selected coin
  // -----------------------------
  const [spot, setSpot] = useState(null);
  const [spotLoading, setSpotLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setSpotLoading(true);
        const p = await getSpot({ id: coinId, vsCurrency: currency });
        if (!alive) return;
        setSpot(Number.isFinite(p) ? p : null);
      } catch {
        if (alive) setSpot(null);
      } finally {
        if (alive) setSpotLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [coinId, currency]);

  // -----------------------------
  // Create rule
  // -----------------------------
  function onCreate(e) {
    e.preventDefault();
    const p = Number(price);
    if (!coinId || Number.isNaN(p) || p <= 0) return;

    add({ coinId, direction, price: p, currency });

    // clear AFTER adding
    setPrice('');
    setQuery('');
  }

  const formValid = coinId && Number(price) > 0;

  // -----------------------------
  // Poller: check active rules every 60s
  // -----------------------------
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

  // -----------------------------
  // Gate: require auth (with Login button + redirect back)
  // -----------------------------
  if (!isAuthed) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="p-4">
          <SectionHeader title="Alerts">Create price alerts</SectionHeader>
          <p className="text-sm mb-4">Please log in to create alerts.</p>

          <Link
            to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
            className="inline-block"
          >
            <Button className="px-5 py-2.5 brand-gradient text-white">
              Login
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

 
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Create alert */}
      <Card className="p-4">
        <SectionHeader title="Create alert">When price crosses your target.</SectionHeader>

        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-2 items-start">
          {/* Search + dropdown */}
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
              {filtered.length === 0 ? (
                <option value="" disabled>No matches — refine your search</option>
              ) : (
                filtered.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.symbol} — {c.name}
                  </option>
                ))
              )}
            </select>

            {/* Spot preview (small helper) */}
            <div className="text-xs text-[hsl(var(--muted))]">
              {spotLoading
                ? 'Fetching live price…'
                : spot != null
                ? `Current price: ${new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(spot)}`
                : '—'}
            </div>
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
            <Button type="submit" disabled={!formValid} className={!formValid ? 'opacity-60 cursor-not-allowed' : ''}>
              Add alert
            </Button>
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
            <thead className=" dark:bg-zinc-900 dark:text-white"
            style={{background:"white" ,color:"black"}}>
              <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2 [&>th]:font-semibold">
                <th>Coin</th><th>Condition</th><th>Status</th><th>Triggered</th><th></th>
              </tr>
            </thead>

            <tbody className={`[&>tr>td]:px-3 text-[hsl(var(--text))] dark:text-white ${density === 'compact' ? '[&>tr>td]:py-1' : '[&>tr>td]:py-2'}`}>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted">No alerts yet.</td>
                </tr>
              ) : rules.map(r => (
                <tr key={r.id} className="border-t dark:border-zinc-800">
                  <td className={`uppercase ${cellPad}`}>{r.coinId}</td>
                  <td className={cellPad}>
                    {r.direction} {r.price.toLocaleString()} {r.currency.toUpperCase()}
                  </td>
                  <td className={cellPad}>
                    <button
                      className={`px-2 py-1 rounded text-xs ${r.active ? 'brand-gradient text-white' : 'border border-zinc-300 dark:border-zinc-700'}`}
                      onClick={() => toggle(r.id)}
                    >
                      {r.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className={`${cellPad} ${r.triggeredAt ? '' : 'text-muted'}`}>
                    {r.triggeredAt ? new Date(r.triggeredAt).toLocaleString() : '—'}
                  </td>
                  <td className={`${cellPad} text-right`}>
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