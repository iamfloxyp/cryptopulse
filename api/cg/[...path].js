export default async function handler(req, res) {
  try {
    const { path = [] } = req.query;
    const sp = new URLSearchParams(req.query);
    sp.delete('path');

    const upstream = `https://api.coingecko.com/api/v3/${Array.isArray(path) ? path.join('/') : path}${sp.size ? `?${sp}` : ''}`;

    const r = await fetch(upstream, { headers: { accept: 'application/json' } });
    const body = await r.text();

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(r.status).send(body);
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', detail: String(err?.message || err) });
  }
}