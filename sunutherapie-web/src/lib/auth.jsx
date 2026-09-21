import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    try { if (api.getToken()) await api.logout(); } catch { /* le serveur est peut-être injoignable */ }
    api.clearToken();
    setUser(null);
  }, []);

  // Chargement initial : si un token traîne, on vérifie qu'il vaut encore quelque chose.
  useEffect(() => {
    let annule = false;
    (async () => {
      if (!api.getToken()) { setLoading(false); return; }
      try {
        const res = await api.getProfile();
        if (!annule) setUser(res.user || res.data || null);
      } catch {
        api.clearToken();
      } finally {
        if (!annule) setLoading(false);
      }
    })();
    return () => { annule = true; };
  }, []);

  // Une 401 émise par le client API fait sortir l'utilisateur partout à la fois.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('sunu:unauthorized', onUnauthorized);
    return () => window.removeEventListener('sunu:unauthorized', onUnauthorized);
  }, []);

  const signIn = async (email, password) => {
    const res = await api.login(email, password);
    if (!res.token) throw new Error(res.message || 'Connexion refusée.');
    api.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const refresh = async () => {
    const res = await api.getProfile();
    setUser(res.user || res.data || null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
