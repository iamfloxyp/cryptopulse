import { forward } from './_util.js';

// GET /api/cg/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  return forward(req, res, '/coins/markets', 60); // cache 60s
}