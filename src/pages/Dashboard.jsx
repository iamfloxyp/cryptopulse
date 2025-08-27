import { useEffect, useMemo, useState } from 'react';
import {useLocal}  from '../store/useLocal';
import Button from '../components/Button';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import KpiCard from '../components/KpiCard';
import ChartPanel from '../components/Chartpanel';
import { getMarkets, getChart } from '../services/coingecko';

function fmtCurrency(n, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n ?? 0);
  } catch {
    return `${currency.toUpperCase()} ${n?.toLocaleString() ?? '—'}`;
  }
}
function fmtPct(n) {
  if (n === null || n === undefined) return '—';
  const s = n.toFixed(2) + '%';
  return n >= 0 ? s : s;
}

export default function Dashboard() {
  const [theme, setTheme] = useLocal('theme', 'dark');
  const [currency, setCurrency] = useLocal('currency', 'usd');
  const [days, setDays] = useState(1);
  const [coinId, setCoinId] = useState('bitcoin');

  const [markets, setMarkets] = useState([]);
  const [loadingMkts, setLoadingMkts] = useState(false);
  const [search, setSearch] = useState('');

  // apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // fetch markets (table + KPIs)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMkts(true);
        const data = await getMarkets({ vsCurrency: currency, perPage: 100, page: 1 });
        if (!alive) return;
        setMarkets(data);
      } catch (e) {
        setMarkets([]);
      } finally {
        if (alive) setLoadingMkts(false);
      }
    })();
    return () => { alive = false; };
  }, [currency]);

  // KPI data for BTC/ETH/SOL/BNB
  const kpis = useMemo(() => {
    const ids = ['bitcoin', 'ethereum', 'solana', 'binancecoin'];
    const byId = Object.fromEntries(markets.map(m => [m.id, m]));
    return ids.map(id => {
      const m = byId[id];
      return {
        id,
        label: id === 'bitcoin' ? 'BTC' : id === 'ethereum' ? 'ETH' : id === 'solana' ? 'SOL' : 'BNB',
        price: m ? fmtCurrency(m.current_price, currency) : '$—',
        dir: (m?.price_change_percentage_24h ?? 0) >= 0 ? 'up' : 'down',
      };
    });
  }, [markets, currency]);

  // filtered table data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (markets ?? []).filter(m =>
      !q || m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q)
    );
  }, [markets, search]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-black/80 dark:text-white/80">Live markets, charts and your watchlist.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            title="Currency"
          >
            {['usd','eur','gbp','ngn'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <section>
        <SectionHeader title="Top markets">
          Click to select a coin; the chart responds.
        </SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <KpiCard
              key={k.id}
              label={k.label}
              value={k.price}
              direction={k.dir}
              active={coinId === k.id}
              onClick={() => setCoinId(k.id)}
            />
          ))}
        </div>
      </section>

      {/* Chart + Watchlist */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <SectionHeader
            title="Price chart"
            aside={
              <div className="flex items-center gap-2">
                {[1, 7, 30].map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={days === d ? 'primary' : 'ghost'}
                    onClick={() => setDays(d)}
                  >
                    {d === 1 ? '24h' : `${d}d`}
                  </Button>
                ))}
              </div>
            }
          >
            {coinId. toUpperCase()} Price Chart ({currency.toUpperCase()})
           
          </SectionHeader>

          <ChartPanel coinId={coinId} days={days} currency={currency} loader={getChart} theme ={theme} />
        </Card>

        <Card className="p-5">
          <SectionHeader title="Search & Watchlist">Save coins you care about.</SectionHeader>
          <input
            className="input mb-3"
            placeholder="Search coin…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="hr my-3"></div>
          <ul className="space-y-2 text-sm">
            <li className="text-[hsl(var(--text))]/80">No items yet.</li>
          </ul>
        </Card>
      </section>

      {/* Markets table */}
      <Card className="p-5 overflow-x-auto">
        <SectionHeader title="Markets table">
          Sort, star to watchlist, click a row to update the chart.
        </SectionHeader>
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-2 [&>th]:font-semibold [&>th]:!text-white">
              <th>Name</th><th>Price</th><th>24h</th><th>Market Cap</th><th>Volume</th><th>★</th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:px-4 [&>tr>td]:py-2">
            {loadingMkts && (
              <tr><td colSpan="6" className="py-6 text-center">Loading markets…</td></tr>
            )}
            {!loadingMkts && filtered.slice(0, 20).map((m) => (
              <tr key={m.id} className="border-t dark:border-zinc-800 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 cursor-pointer"
                  onClick={() => {setCoinId(m.id);setSearch('');}}>
                <td className="whitespace-nowrap">{m.name} <span className="text-[hsl(var(--text))]/60">({m.symbol.toUpperCase()})</span></td>
                <td className="whitespace-nowrap">{fmtCurrency(m.current_price, currency)}</td>
                <td className={m.price_change_percentage_24h >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}>
                  {fmtPct(m.price_change_percentage_24h)}
                </td>
                <td className="whitespace-nowrap">{fmtCurrency(m.market_cap, currency)}</td>
                <td className="whitespace-nowrap">{fmtCurrency(m.total_volume, currency)}</td>
                <td>☆</td>
              </tr>
            ))}
            {!loadingMkts && filtered.length === 0 && (
              <tr><td colSpan="6" className="py-6 text-center">No results</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </main>
  );
}