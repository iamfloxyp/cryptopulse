// src/services/coingecko.js
const API = 'https://api.coingecko.com/api/v3';

async function http(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Network ${res.status}: ${text || 'Failed to fetch'}`);
  }
  return res.json();
}

export async function getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 }) {
  const url =
    `${API}/coins/markets?vs_currency=${vsCurrency}` +
    `&order=market_cap_desc&per_page=${perPage}&page=${page}` +
    `&sparkline=false&price_change_percentage=24h`;
  return http(url);
}

export async function getChart({ id, vsCurrency = 'usd', days = 1 }) {
  const url = `${API}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  return http(url); 
}