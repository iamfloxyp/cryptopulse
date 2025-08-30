// backend/server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // dev-friendly; tighten in prod

// -------------------------------
// In-memory OTP store (10 min TTL)
// -------------------------------
const codes = new Map(); // phone -> { code, expiresAt }
function setOtp(phone, code, ttlMs = 10 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  codes.set(phone, { code, expiresAt });
  setTimeout(() => {
    const cur = codes.get(phone);
    if (cur && cur.expiresAt <= Date.now()) codes.delete(phone);
  }, ttlMs + 1000);
}
function checkOtp(phone, code) {
  const rec = codes.get(phone);
  if (!rec) return false;
  if (rec.expiresAt < Date.now()) { codes.delete(phone); return false; }
  const ok = rec.code === code;
  if (ok) codes.delete(phone); // one-time use
  return ok;
}

// -------------------------------
// Health
// -------------------------------
app.get("/", (_req, res) => res.json({ ok: true, name: "CryptoPulse API" }));

// -------------------------------
// CoinGecko Proxy (sponsor data)
// -------------------------------
const CG = "https://api.coingecko.com/api/v3";

// markets table + KPIs
app.get("/api/markets", async (req, res) => {
  try {
    const { vs = "usd", page = "1", perPage = "100" } = req.query;
    const url = `${CG}/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("coingecko_markets_failed");
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "markets_failed" });
  }
});

// chart
app.get("/api/chart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { vs = "usd", days = "1" } = req.query;
    const url = `${CG}/coins/${id}/market_chart?vs_currency=${vs}&days=${days}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("coingecko_chart_failed");
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "chart_failed" });
  }
});

// spot (used by alerts poller)
app.get("/api/spot/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { vs = "usd" } = req.query;
    const url = `${CG}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vs)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("coingecko_spot_failed");
    const data = await r.json();
    res.json({ id, vs, price: Number(data?.[id]?.[vs]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "spot_failed" });
  }
});

// -------------------------------
// Vonage SMS OTP (sponsor auth)
// -------------------------------
app.post("/api/send-code", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone_required" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(phone, code);

    const params = new URLSearchParams();
    params.append("api_key", process.env.VONAGE_API_KEY || "");
    params.append("api_secret", process.env.VONAGE_API_SECRET || "");
    params.append("to", phone);
    params.append("from", process.env.VONAGE_FROM || "CryptoPulse");
    params.append("text", `Your CryptoPulse code is: ${code}`);

    const resp = await fetch("https://rest.nexmo.com/sms/json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
    });
    const result = await resp.json();
    const status = result?.messages?.[0]?.status ?? "unknown";
    if (status !== "0") {
      console.error("Vonage send error:", result);
      return res.status(500).json({ error: "sms_send_failed", details: result });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "send_code_failed" });
  }
});

app.post("/api/verify-code", (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: "phone_and_code_required" });
  if (checkOtp(phone, String(code))) return res.json({ ok: true, verified: true });
  return res.status(400).json({ error: "invalid_or_expired_code" });
});

// -------------------------------
// Start server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});