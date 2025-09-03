const BASE = '/api/cg';

export async function getSpot({ id, vsCurrency = 'usd', signal } = {}) {
  const url = new URL(`${BASE}/spot`, window.location.origin);
  url.searchParams.set('id', id);
  url.searchParams.set('vs_currency', vsCurrency);

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`spot ${res.status}`);
  const json = await res.json();
  const key = (json && json[id] && json[id][vsCurrency]) ?? NaN;
  return Number(key);
}