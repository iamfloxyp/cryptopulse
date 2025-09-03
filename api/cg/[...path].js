// api/cg/[...path].js
export default async function handler(req, res) {
  try {
    const { path = [] } = req.query; // catch-all segments
    const suffix = Array.isArray(path) ? path.join('/') : String(path || '');
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `https://api.coingecko.com/api/v3/${suffix}${qs}`;

    const r = await fetch(url, {
      method: req.method,
      headers: { accept: 'application/json', 'user-agent': 'cryptopulse' }
    });

    const text = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(r.status).send(text);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'proxy_failed', message: String(e?.message || e) });
  }
}