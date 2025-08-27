// src/store/alerts.js
import { useMemo } from "react";
import { useLocal } from "./useLocal";

// custom hook to manage alerts
export function useAlerts() {
  const [rules, setRules] = useLocal("alerts", []); 
  // rules = [{ id, coinId, direction, price, currency, active, triggeredAt }]

  // add new alert rule
  const add = ({ coinId, direction, price, currency }) => {
    const id = crypto.randomUUID?.() || String(Date.now());
    setRules((prev) => [
      ...prev,
      { id, coinId, direction, price, currency, active: true, triggeredAt: null },
    ]);
  };

  // remove alert
  const remove = (id) => setRules((prev) => prev.filter((r) => r.id !== id));

  // toggle active/inactive
  const toggle = (id) =>
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );

  // mark alert triggered
  const markTriggered = (id) =>
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, triggeredAt: Date.now(), active: false } : r
      )
    );

  // optional derived data
  const activeCount = useMemo(
    () => rules.filter((r) => r.active).length,
    [rules]
  );

  return { rules, add, remove, toggle, markTriggered, activeCount };
}