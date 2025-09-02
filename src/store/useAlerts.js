
import { useMemo } from "react";
import { useLocal } from "./useLocal";


export function useAlerts() {
  const [rules, setRules] = useLocal("alerts", []); 


  
  const add = ({ coinId, direction, price, currency }) => {
    const id = crypto.randomUUID?.() || String(Date.now());
    setRules((prev) => [
      ...prev,
      { id, coinId, direction, price, currency, active: true, triggeredAt: null },
    ]);
  };


  const remove = (id) => setRules((prev) => prev.filter((r) => r.id !== id));


  const toggle = (id) =>
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );

  
  const markTriggered = (id) =>
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, triggeredAt: Date.now(), active: false } : r
      )
    );

  
  const activeCount = useMemo(
    () => rules.filter((r) => r.active).length,
    [rules]
  );

  return { rules, add, remove, toggle, markTriggered, activeCount };
}