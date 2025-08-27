const API = 'https://api.coingecko.com/api/v3';

/** Top markets list for table & KPIs */
export async function getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 }) {
  const url = `${API}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load markets');
  return res.json();
}

/** Chart points for a coin (1 | 7 | 30 days) */
export async function getChart({ id, vsCurrency = 'usd', days = 1 }) {
  const url = `${API}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load chart');
  return res.json(); // { prices: [[timestamp, price], ...] }
}