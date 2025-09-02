
export async function robustFetch(url, { retries = 2, timeout = 8000, signal, ...init } = {}) {
  let attempt = 0;
  let lastErr;

  while (attempt <= retries) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(new Error('timeout')), timeout);
    try {
      const resp = await fetch(url, { ...init, signal: signal ?? ac.signal });
      clearTimeout(t);

      // Handle 429 (rate limit) with backoff
      if (resp.status === 429) {
        const wait = Math.min(1500 * (attempt + 1), 5000);
        await new Promise(r => setTimeout(r, wait));
        attempt++;
        continue;
      }

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      // Backoff on network errors
      const wait = Math.min(800 * (attempt + 1), 2500);
      await new Promise(r => setTimeout(r, wait));
      attempt++;
    }
  }
  throw lastErr ?? new Error('request_failed');
}