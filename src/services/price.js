


export async function getSpot({ id, vsCurrency }) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    id
  )}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("spot failed");
  const json = await res.json();
  const val = json?.[id]?.[vsCurrency];
  return typeof val === "number" ? val : NaN;
}


export async function getTop100({ vsCurrency }) {
  const url =
    `https://api.coingecko.com/api/v3/coins/markets?` +
    `vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("markets failed");
  const list = await res.json();
  
  return (Array.isArray(list) ? list : []).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: String(c.symbol || "").toUpperCase(),
  }));
}