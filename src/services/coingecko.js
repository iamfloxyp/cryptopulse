// src/services/coingecko.js

const BASES = [
  '/api/cg',                                      // Vercel serverless proxy (production)
  '/api-cg',                                      // Vite dev proxy (local)
  'https://api.coingecko.com/api/v3'              // direct fallback (may hit CORS in some setups)
];

async function fetchJSON(url, opts = {}, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { accept: 'application/json', ...(opts.headers || {}) } });
      if (!r.ok) {
        if ((r.status === 429 || r.status >= 500) && i < retries) {
          await new Promise(res => setTimeout(res, 700 * (i + 1)));
          continue;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      }
      return await r.json();
    } catch (e) {
      lastErr = e;
      if (i < retries) {
        await new Promise(res => setTimeout(res, 700 * (i + 1)));
        continue;
      }
    }
  }
  throw lastErr;
}

async function tryBases(pathAndQuery, opts) {
  let lastErr;
  for (const b of BASES) {
    try {
      const url = `${b}${pathAndQuery}`;
      return await fetchJSON(url, opts);
    } catch (e) {
      lastErr = e;
      // try next base
    }
  }
  throw lastErr;
}

/* ----------------- public API ----------------- */

export async function getMarkets({ vsCurrency = 'usd', perPage = 250, page = 1 }) {
  const q = `?vs_currency=${encodeURIComponent(vsCurrency)}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
  return tryBases(`/coins/markets${q}`);
}

export async function getChart({ id = 'bitcoin', vsCurrency = 'usd', days = 7 }) {
  const q = `?vs_currency=${encodeURIComponent(vsCurrency)}&days=${days}`;
  return tryBases(`/coins/${encodeURIComponent(id)}/market_chart${q}`);
}

export async function getSpot({ id = 'bitcoin', vsCurrency = 'usd' }) {
  const q = `?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
  const data = await tryBases(`/simple/price${q}`);
  const p = data?.[id]?.[vsCurrency];
  return Number.isFinite(p) ? p : NaN;
}