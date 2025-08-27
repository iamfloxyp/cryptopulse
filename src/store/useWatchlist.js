// src/store/useWatchlist.js
import { useLocal } from './useLocal';

export function useWatchlist() {
  const [list, setList] = useLocal('watchlist', []); // ['bitcoin','ethereum',...]

  const isWatched = (id) => list.includes(id);

  const toggle = (id) =>
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const remove = (id) => setList((prev) => prev.filter((x) => x !== id));

  return { list, isWatched, toggle, remove };
}