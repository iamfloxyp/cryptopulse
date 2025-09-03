// // src/services/coingecko.js

// const BASES = [
//   '/api/cg',                                      // Vercel serverless proxy (production)
//   '/api-cg',                                      // Vite dev proxy (local)
//   'https://api.coingecko.com/api/v3'              // direct fallback (may hit CORS in some setups)
// ];

// async function fetchJSON(url, opts = {}, retries = 2) {
//   let lastErr;
//   for (let i = 0; i <= retries; i++) {
//     try {
//       const r = await fetch(url, { ...opts, headers: { accept: 'application/json', ...(opts.headers || {}) } });
//       if (!r.ok) {
//         if ((r.status === 429 || r.status >= 500) && i < retries) {
//           await new Promise(res => setTimeout(res, 700 * (i + 1)));
//           continue;
//         }
//         throw new Error(`${r.status} ${r.statusText}`);
//       }
//       return await r.json();
//     } catch (e) {
//       lastErr = e;
//       if (i < retries) {
//         await new Promise(res => setTimeout(res, 700 * (i + 1)));
//         continue;
//       }
//     }
//   }
//   throw lastErr;
// }

// async function tryBases(pathAndQuery, opts) {
//   let lastErr;
//   for (const b of BASES) {
//     try {
//       const url = `${b}${pathAndQuery}`;
//       return await fetchJSON(url, opts);
//     } catch (e) {
//       lastErr = e;
//       // try next base
//     }
//   }
//   throw lastErr;
// }

// /* ----------------- public API ----------------- */

// export async function getMarkets({ vsCurrency = 'usd', perPage = 250, page = 1 }) {
//   const q = `?vs_currency=${encodeURIComponent(vsCurrency)}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
//   return tryBases(`/coins/markets${q}`);
// }

// export async function getChart({ id = 'bitcoin', vsCurrency = 'usd', days = 7 }) {
//   const q = `?vs_currency=${encodeURIComponent(vsCurrency)}&days=${days}`;
//   return tryBases(`/coins/${encodeURIComponent(id)}/market_chart${q}`);
// }

// export async function getSpot({ id = 'bitcoin', vsCurrency = 'usd' }) {
//   const q = `?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
//   const data = await tryBases(`/simple/price${q}`);
//   const p = data?.[id]?.[vsCurrency];
//   return Number.isFinite(p) ? p : NaN;
// }

// src/services/coingecko.js
// Small retry/backoff wrapper for flaky/slow responses (handles 429 too)
async function robustFetch(url, options = {}) {
  const {
    retries = 2,       // how many times to retry after the first attempt
    backoff = 700,     // initial wait in ms; grows each retry
    signal,
    headers = { accept: 'application/json' },
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal, headers });
      if (res.status === 429 && attempt < retries) {
        // rate-limited — wait then retry
        await new Promise(r => setTimeout(r, backoff * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      // network error — wait then retry
      await new Promise(r => setTimeout(r, backoff * (attempt + 1)));
    }
  }
}

const DEV = import.meta.env.DEV;
// In dev we hit the Vite proxy to avoid CORS; in prod we call CG directly.
const BASE = DEV ? '/api-cg' : 'https://api.coingecko.com/api/v3';

// tiny sleep
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJSON(path, params = {}, { retries = 2, backoff = 600, timeout = 10_000 } = {}) {
  // build URL
  const url = new URL((path.startsWith('http') ? path : BASE + path), window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  // timeout
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);

  try {
    const res = await fetch(url.toString(), {
      signal: ac.signal,
      headers: { accept: 'application/json' },
    });

    // Handle CG ratelimit politely
    if (res.status === 429 && retries > 0) {
      await wait(backoff);
      return fetchJSON(path, params, { retries: retries - 1, backoff: backoff * 1.7, timeout });
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Public API used by your pages/components (names unchanged)
export function getMarkets({ vsCurrency = 'usd', perPage = 250, page = 1 } = {}) {
  return fetchJSON('/coins/markets', {
    vs_currency: vsCurrency,
    order: 'market_cap_desc',
    per_page: perPage,
    page,
    sparkline: 'false',
    price_change_percentage: '24h',
  });
}

export function getChart({ id, vsCurrency = 'usd', days = 7 } = {}) {
  return fetchJSON(`/coins/${encodeURIComponent(id)}/market_chart`, {
    vs_currency: vsCurrency,
    days,
  });
}

export async function getSpot({ id, vsCurrency = 'usd' } = {}) {
  const data = await fetchJSON('/simple/price', {
    ids: id,
    vs_currencies: vsCurrency,
  });
  return Number(data?.[id]?.[vsCurrency]) || NaN;
}