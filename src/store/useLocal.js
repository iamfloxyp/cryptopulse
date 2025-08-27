// src/store/useLocal.js
import { useEffect, useState } from "react";

/**
 * useLocal — state that syncs to localStorage
 * Usage: const [val, setVal] = useLocal('key', initial)
 */
export function useLocal(key, initialValue) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  };

  // ✅ Correct: use function form so it runs once
  const [value, setValue] = useState(() => read());

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}