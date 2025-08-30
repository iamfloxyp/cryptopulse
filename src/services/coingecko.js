// src/services/coingecko.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/** Top markets list for table & KPIs (backend proxy) */
export async function getMarkets({ vsCurrency = "usd", perPage = 100, page = 1 }) {
  const url = `${API}/api/markets?vs=${vsCurrency}&perPage=${perPage}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load markets");
  return res.json();
}

/** Chart points for a coin (1 | 7 | 30 days) (backend proxy) */
export async function getChart({ id, vsCurrency = "usd", days = 1 }) {
  const url = `${API}/api/chart/${id}?vs=${vsCurrency}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load chart");
  return res.json(); // { prices: [[timestamp, price], ...] }
}