import { forward } from './_util.js';

// GET /api/cg/spot?id=bitcoin&vs_currency=usd
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id, vs_currency } = req.query || {};
  if (!id || !vs_currency) {
    res.status(400).json({ error: 'missing_params', need: 'id, vs_currency' });
    return;
  }
  // maps to /simple/price?ids=...&vs_currencies=...
  req.query = { ids: id, vs_currencies: vs_currency };
  return forward(req, res, '/simple/price', 30);
}