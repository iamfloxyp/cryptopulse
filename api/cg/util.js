export function json(res, status, data) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // CORS for browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

export function ok(res, data, cacheSeconds = 60) {
  // Cache at the edge/proxy to reduce 429s
  res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, max-age=0, stale-while-revalidate=60`);
  json(res, 200, data);
}

export async function forward(req, res, path, cacheSeconds = 60) {
  try {
    const url = new URL(`https://api.coingecko.com/api/v3${path}`);
    // pass through query params
    Object.entries(req.query || {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const cg = await fetch(url, {
      headers: { accept: 'application/json' },
      // small timeout to avoid hanging
      cache: 'no-store'
    });

    if (!cg.ok) {
      const text = await cg.text().catch(() => '');
      return json(res, cg.status, { error: 'upstream_error', status: cg.status, body: text.slice(0, 500) });
    }
    const data = await cg.json();
    return ok(res, data, cacheSeconds);
  } catch (err) {
    return json(res, 500, { error: 'proxy_failed', message: err?.message || String(err) });
  }
}