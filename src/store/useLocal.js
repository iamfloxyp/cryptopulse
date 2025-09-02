
import { useEffect, useState } from "react";


export function useLocal(key, initialValue) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState(read);

  
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      
      window.dispatchEvent(
        new CustomEvent("local-update", { detail: { key, value } })
      );
    } catch {}
  }, [key, value]);

  
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) {
  
        setValue(read());
      }
    };
    const onLocalUpdate = (e) => {
      if (e.detail?.key === key) {
        setValue(e.detail.value);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("local-update", onLocalUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("local-update", onLocalUpdate);
    };
  }, [key]);

  return [value, setValue];
}