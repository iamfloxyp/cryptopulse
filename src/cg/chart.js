import { forward } from './_util.js';

// GET /api/cg/chart?id=bitcoin&vs_currency=usd&days=7
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id, vs_currency, days } = req.query || {};
  if (!id || !vs_currency || !days) {
    res.status(400).json({ error: 'missing_params', need: 'id, vs_currency, days' });
    return;
  }
  // maps to /coins/{id}/market_chart
  req.query = { vs_currency, days }; // keep only needed params
  return forward(req, res, `/coins/${encodeURIComponent(id)}/market_chart`, 60);
}