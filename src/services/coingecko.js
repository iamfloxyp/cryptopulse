// Single base that works in dev (Vite proxy) and prod (Vercel functions)
const BASE = '/api/cg';

export async function getMarkets({ vsCurrency = 'usd', perPage = 250, page = 1, signal } = {}) {
  const url = new URL(`${BASE}/markets`, window.location.origin);
  url.searchParams.set('vs_currency', vsCurrency);
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h');

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`markets ${res.status}`);
  return res.json();
}

export async function getChart({ id, vsCurrency = 'usd', days = 7, signal } = {}) {
  const url = new URL(`${BASE}/chart`, window.location.origin);
  url.searchParams.set('id', id);
  url.searchParams.set('vs_currency', vsCurrency);
  url.searchParams.set('days', String(days));

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`chart ${res.status}`);
  return res.json();
}