// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocal } from '../store/useLocal';
import Button from '../components/Button';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import KpiCard from '../components/KpiCard';
import ChartPanel from '../components/ChartPanel';
import { useWatchlist } from '../store/useWatchlist';
import { getMarkets, getChart } from '../services/coingecko';

/* ---------- helpers ---------- */
function fmtCurrency(n, currency) {
  if (n === null || n === undefined) return '—';

  // Special formatting for NGN to keep values short
  if (currency === 'ngn') {
    if (n >= 1e12) return `₦${(n / 1e12).toFixed(1)}T`; 
    if (n >= 1e9)  return `₦${(n / 1e9).toFixed(1)}B`;  
    if (n >= 1e6)  return `₦${(n / 1e6).toFixed(1)}M`;  
    return `₦${n.toLocaleString()}`;
  }

  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency.toUpperCase()} ${n.toLocaleString()}`;
  }
}
function fmtPct(n) {
  if (n === null || n === undefined) return '—';
  const s = n.toFixed(2) + '%';
  return n >= 0 ? s : s;
}
function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-md px-4 py-2 text-sm text-white bg-zinc-900/90 border border-zinc-700 shadow-lg">
        {message}
        <button className="ml-3 underline text-white/90" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [theme, setTheme] = useLocal('theme', 'dark');
  const [currency, setCurrency] = useLocal('currency', 'usd');

  // user prefs
  const [defaultCoin]  = useLocal('defaultCoin', 'bitcoin');
  const [defaultRange] = useLocal('defaultRange', 7);
  const [chartGrid]    = useLocal('chartGrid', true);
  const [chartSmooth]  = useLocal('chartSmooth', true);

  const [days, setDays] = useState(defaultRange);
  const [coinId, setCoinId] = useState(defaultCoin);

  const { list: watchlist, isWatched, toggle: toggleWatch } = useWatchlist();

  const [markets, setMarkets] = useState([]);
  const [loadingMkts, setLoadingMkts] = useState(false);

  // search (debounced)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // sorting + pagination (persist some)
  const [sortKey, setSortKey]       = useLocal('tableSortKey', 'market_cap'); 
  const [sortDir, setSortDir]       = useLocal('tableSortDir', 'desc');       
  const [rowsPerPage, setRowsPerPage] = useLocal('rowsPerPage', 20);          
  const [page, setPage] = useState(1);                                        
  const [watchOnly, setWatchOnly] = useLocal('watchOnly', false);

  function onSort(key) {
    setPage(1);
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }
  function arrowFor(key) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  // Export watchlist JSON
  function exportWatchlist() {
    const data = JSON.stringify(watchlist, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptopulse-watchlist.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import watchlist JSON
  const fileInputRef = React.useRef(null);
  const [toast, setToast] = useState('');
  function openImport() { fileInputRef.current?.click(); }
  function onImportFile(e) {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '[]'));
          if (!Array.isArray(parsed)) throw new Error('Invalid file format');
          let added = 0;
          parsed.forEach(id => {
            if (typeof id === 'string' && !isWatched(id)) {
              toggleWatch(id);
              added++;
            }
          });
          setToast(`Imported ${added} coin(s) to watchlist`);
        } catch (err) {
          setToast('Failed to import: invalid JSON');
        }
      };
      reader.readAsText(f);
    } catch {
      setToast('Failed to import file');
    } finally {
      e.target.value = ''; 
    }
  }

  
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
        // fetch more rows by default
        const data = await getMarkets({ vsCurrency: currency, perPage: 250, page: 1 });
        if (!alive) return;
        setMarkets(data);
      } catch {
        setMarkets([]);
        setToast('Could not load markets. Please retry.');
      } finally {
        if (alive) setLoadingMkts(false);
      }
    })();
    return () => { alive = false; };
  }, [currency]);

  // KPI data for BTC/ETH/SOL/BNB with colored icons
  const kpis = useMemo(() => {
    const ids = ['bitcoin', 'ethereum', 'solana', 'binancecoin'];
    const colors = {
      bitcoin:     'hsl(var(--up))',
      ethereum:    'hsl(var(--down))',
      solana:      '#8b5cf6',
      binancecoin: '#22c55e',
    };
    const byId = Object.fromEntries(markets.map(m => [m.id, m]));
    return ids.map(id => {
      const m = byId[id];
      return {
        id,
        label: id === 'bitcoin' ? 'BTC' : id === 'ethereum' ? 'ETH' : id === 'solana' ? 'SOL' : 'BNB',
        price: m ? fmtCurrency(m.current_price, currency) : '$—',
        dir: (m?.price_change_percentage_24h ?? 0) >= 0 ? 'up' : 'down',
        iconColor: colors[id],
      };
    });
  }, [markets, currency]);

  // Filtered
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return (markets ?? [])
      .filter(m => (!q || m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q)))
      .filter(m => (!watchOnly || isWatched(m.id)));
  }, [markets, debouncedSearch, watchOnly, isWatched]);

  // Sorted + paginated
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'name':       return a.name.localeCompare(b.name) * dir;
        case 'price':      return ((a.current_price ?? 0) - (b.current_price ?? 0)) * dir;
        case 'change':     return ((a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)) * dir;
        case 'market_cap': return ((a.market_cap ?? 0) - (b.market_cap ?? 0)) * dir;
        case 'volume':     return ((a.total_volume ?? 0) - (b.total_volume ?? 0)) * dir;
        default:           return 0;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const pageStart  = (page - 1) * rowsPerPage;
  const pageRows   = sorted.slice(pageStart, pageStart + rowsPerPage);

  // clamp page if rowsPerPage changed or list changed
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-black/80 dark:text-white/80">
            Live markets, charts and your watchlist.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sxs sm:px-3 sm:py-2 sm:text-sm"
            title="Currency"
          >
            {['usd','eur','gbp','ngn'].map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
          <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <section>
        <SectionHeader title="Top markets">Click to select a coin; the chart responds.</SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {kpis.map((k, i) => (
            <div
              key={k.id}
              className="animate-fadeUp min-h-30"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <KpiCard
                label={k.label}
                value={k.price}
                direction={k.dir}
                active={coinId === k.id}
                onClick={() => setCoinId(k.id)}
                iconColor={k.iconColor}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Chart + Watchlist */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* CHART */}
        <div className="lg:col-span-2 min-w-0">
          <Card className="p-5 min-w-0 overflow-hidden">
            <SectionHeader
              title="Price chart"
              aside={
                <div className="flex items-center gap-2">
                  {[1, 7, 30].map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant="pill"
                      data-active={days === d}
                      onClick={() => setDays(d)}
                      className="min-w-[3.25rem] pressable"
                    >
                      {d === 1 ? '24h' : `${d}d`}
                    </Button>
                  ))}
                </div>
              }
            >
              {coinId.toUpperCase()} Price Chart ({currency.toUpperCase()})
            </SectionHeader>

            <div className="animate-fadeUp min-w-0" style={{ animationDelay: '90ms' }}>
              <ChartPanel
                coinId={coinId}
                days={days}
                currency={currency}
                loader={getChart}
                theme={theme}
                chartGrid={chartGrid}
                chartSmooth={chartSmooth}
              />
            </div>
          </Card>
        </div>

        {/* WATCHLIST */}
        <div className="min-w-0">
          <Card className="p-5">
            <SectionHeader title="Search & Watchlist">
              Save coins you care about.
            </SectionHeader>

            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <input
                className="input w-full h-11 text-sm"
                placeholder="Search coin…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm px-2 py-1 rounded-md border border-[hsl(var(--border))]">
                <input
                  type="checkbox"
                  checked={watchOnly}
                  onChange={(e) => { setWatchOnly(e.target.checked); setPage(1); }}
                />
                Watchlist only
              </label>

              {/* Export / Import */}
              <button
                onClick={exportWatchlist}
                className="px-3 py-2 text-xs rounded-[10px] text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow hover:opacity-95"
                title="Download your watchlist as JSON"
              >
                Export
              </button>
              <button
                onClick={openImport}
                className="px-3 py-2 text-xs rounded-[10px] text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 shadow hover:opacity-95"
                title="Import a JSON watchlist"
              >
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImportFile}
              />
            </div>

            <div className="hr my-3" />
            <ul className="space-y-2 text-sm">
              {watchlist.length === 0 ? (
                <li className="text-[hsl(var(--text))]/80">No items yet.</li>
              ) : (
                watchlist.map((id) => (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-3 border border-[hsl(var(--border))] rounded-md px-3 py-2"
                  >
                    <button
                      onClick={() => setCoinId(id)}
                      className="hover:underline uppercase truncate max-w-[12rem]"
                      title="Show on chart"
                    >
                      {id}
                    </button>
                    <button
                      onClick={() => toggleWatch(id)}
                      className="text-red-500 hover:underline shrink-0"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </section>

      {/* Markets table */}
      <Card className="p-5">
        <SectionHeader title="Markets table">
          Sort, star to watchlist, click a row to update the chart.
        </SectionHeader>

        {/* Scrollable table with sticky header */}
        <div className="relative max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg">
          <table className="w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10  dark:bg-zinc-900 dark:text-white"
            style={{background:"white" , color:"black"}}>
              <tr className="[&>th]:px-2 [&>th]:py-2 [&>th]:font-semibold">
                <th
                  className="text-left w-[40%] sm:w-[24%] cursor-pointer select-none"
                  onClick={() => onSort('name')}
                >
                  Name{arrowFor('name')}
                </th>
                <th
                  className="text-right w-[20%] sm:w-[18%] cursor-pointer select-none"
                  onClick={() => onSort('price')}
                >
                  Price{arrowFor('price')}
                </th>
                <th
                  className="text-right w-[20%] sm:w-[12%] cursor-pointer select-none"
                  onClick={() => onSort('change')}
                >
                  24h{arrowFor('change')}
                </th>
                <th
                  className="hidden sm:table-cell text-right w-[23%] cursor-pointer select-none"
                  onClick={() => onSort('market_cap')}
                >
                  Market Cap{arrowFor('market_cap')}
                </th>
                <th
                  className="hidden sm:table-cell text-right w-[23%] cursor-pointer select-none"
                  onClick={() => onSort('volume')}
                >
                  Volume{arrowFor('volume')}
                </th>
                <th className="text-center w-[8%] sm:w-[6%]">★</th>
              </tr>
            </thead>

            <tbody className="[&>tr>td]:px-2">
              {loadingMkts && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={`sk-${i}`}>
                      <td colSpan={6}>
                        <div className="h-8 shimmer my-2" />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!loadingMkts &&
                pageRows.map((m, i) => {
                  const up = (m.price_change_percentage_24h ?? 0) >= 0;
                  return (
                    <React.Fragment key={m.id}>
                      {/* MAIN ROW */}
                      <tr
                        className={[
                          "border-t dark:border-zinc-800 cursor-pointer transition-colors border-l-2",
                          up
                            ? "border-l-[hsl(var(--up))] hover:bg-[hsl(var(--up)/0.08)] dark:hover:bg-[hsl(var(--up)/0.12)]"
                            : "border-l-[hsl(var(--down))] hover:bg-[hsl(var(--down)/0.08)] dark:hover:bg-[hsl(var(--down)/0.12)]",
                        ].join(" ")}
                        style={{ animationDelay: `${i * 50}ms` }}
                        onClick={() => { setCoinId(m.id); setSearch(''); }}
                      >
                        {/* Name */}
                        <td className="whitespace-normal sm:whitespace-nowrap break-words leading-snug">
                          {m.name}{" "}
                          <span className="text-[hsl(var(--text))]/60">
                            ({m.symbol.toUpperCase()})
                          </span>
                        </td>

                        {/* Price */}
                        <td className="text-right whitespace-normal sm:whitespace-nowrap break-words leading-snug">
                          {fmtCurrency(m.current_price, currency)}
                        </td>

                        {/* 24h */}
                        <td
                          className="text-right font-semibold whitespace-normal sm:whitespace-nowrap leading-snug"
                          style={{
                            color:
                              (m.price_change_percentage_24h ?? 0) > 0
                                ? "hsl(var(--up))"
                                : (m.price_change_percentage_24h ?? 0) < 0
                                ? "hsl(var(--down))"
                                : "hsl(var(--muted))",
                          }}
                        >
                          {(m.price_change_percentage_24h ?? 0) > 0 ? "▲ " :
                          (m.price_change_percentage_24h ?? 0) < 0 ? "▼ " : ""}
                          {fmtPct(m.price_change_percentage_24h)}
                        </td>

                        {/* Market Cap (desktop only) */}
                        <td className="hidden sm:table-cell text-right whitespace-nowrap">
                          {fmtCurrency(m.market_cap, currency)}
                        </td>

                        {/* Volume (desktop only) */}
                        <td className="hidden sm:table-cell text-right whitespace-nowrap">
                          {fmtCurrency(m.total_volume, currency)}
                        </td>

                        {/* Star */}
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleWatch(m.id)}
                            className="text-xl pressable"
                            style={{ color: isWatched(m.id) ? "#facc15" : "#9ca3af" }}
                            aria-label={isWatched(m.id) ? "Remove from watchlist" : "Add to watchlist"}
                            title={isWatched(m.id) ? "Remove from watchlist" : "Add to watchlist"}
                          >
                            {isWatched(m.id) ? "★" : "☆"}
                          </button>
                        </td>
                      </tr>

                      {/* MOBILE DETAIL ROW */}
                      <tr className="sm:hidden border-b dark:border-zinc-800">
                        <td colSpan={6} className="pt-1 pb-3">
                          <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                            <div className="opacity-70">Market Cap</div>
                            <div className="text-right break-words">
                              {fmtCurrency(m.market_cap, currency)}
                            </div>
                            <div className="opacity-70">Volume</div>
                            <div className="text-right break-words">
                              {fmtCurrency(m.total_volume, currency)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

              {!loadingMkts && sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Prev / Next only, beautified) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">Rows per page:</span>
            <select
              className="input h-8 w-[4.5rem] text-xs"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="text-xs opacity-70">
            Page {page} of {totalPages} — {sorted.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 text-xs rounded-[10px] text-white bg-gradient-to-r from-indigo-500 to-sky-500 shadow transition ${
                page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'
              }`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹ Prev
            </button>
            <button
              className={`px-4 py-2 text-xs rounded-[10px] text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow transition ${
                page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'
              }`}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      </Card>

      <Toast message={toast} onClose={() => setToast('')} />
    </main>
  );
}