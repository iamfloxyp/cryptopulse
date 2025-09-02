// src/services/coingecko.js

// Match your Vite dev proxy prefix exactly:
const DEV_BASE  = '/api-cg';   // <= this matches vite.config.js
const PROD_BASE = '/api/cg';   // we'll add a tiny serverless proxy later on Vercel
const API = import.meta.env.DEV ? DEV_BASE : PROD_BASE;

export async function getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1, signal } = {}) {
  const url =
    `${API}/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load markets');
  return res.json();
}

export async function getChart({ id, vsCurrency = 'usd', days = 1, signal } = {}) {
  const url = `${API}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${encodeURIComponent(vsCurrency)}&days=${days}`;
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load chart');
  return res.json();
}

export async function getSpot({ id, vsCurrency = 'usd', signal } = {}) {
  const url = `${API}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load spot');
  const json = await res.json();
  return Number(json?.[id]?.[vsCurrency]);
}