// src/services/auth.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function sendCode({ phone }) {
  const r = await fetch(`${API}/api/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });
  if (!r.ok) throw new Error("send_code_failed");
  return r.json();
}

export async function verifyCode({ phone, code }) {
  const r = await fetch(`${API}/api/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code })
  });
  if (!r.ok) throw new Error("verify_code_failed");
  return r.json();
}