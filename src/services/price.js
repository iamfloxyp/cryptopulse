// src/services/price.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function getSpot({ id, vsCurrency = "usd" }) {
  const res = await fetch(`${API}/api/spot/${id}?vs=${vsCurrency}`);
  if (!res.ok) throw new Error("spot_failed");
  const data = await res.json();
  return Number(data.price);
}