// src/store/useAuth.js
import { useLocal } from './useLocal';

export function useAuth() {
  const [user, setUser] = useLocal('user', null);
  const isAuthed = !!user;

  function login(payload) {
    // payload: { phone, requestId? }
    setUser(payload);
  }

  function logout() {
    setUser(null);
  }

  return { isAuthed, user, login, logout };
}