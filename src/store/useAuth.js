
import { useLocal } from './useLocal';

export function useAuth() {
  const [user, setUser] = useLocal('user', null);
  const isAuthed = !!user;

  function login(payload) {
    
    setUser(payload);
  }

  function logout() {
    setUser(null);
  }

  return { isAuthed, user, login, logout };
}