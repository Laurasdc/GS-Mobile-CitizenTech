import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { ApiError, setAccessToken, solicitarApi, subscribeSessionExpired } from '../services/api';
import { loadToken, storeToken, removeToken } from './session-storage';
export interface Account { id: string; nome: string; email: string; perfil: 'Morador' | 'Gestor' }
interface Session { usuario: Account; expiraEm: string; token: string | null }
const Context = createContext<{
  user: Account | null; ready: boolean; error: string | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>; restore: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const restore = useCallback(async () => {
    const current = ++revision.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const token = await loadToken();
      setError(null);
      if (current !== revision.current) return;
      setAccessToken(token);
      if (Platform.OS !== 'web' && !token) { setUser(null); return; }
      const account = await solicitarApi<Account>('/auth/me', { autenticado: true, signal: controller.signal });
      if (current === revision.current) setUser(account);
    } catch (cause) {
      if (current !== revision.current) return;
      setUser(null);
      if (!(cause instanceof ApiError && cause.status === 401)) setError('Não foi possível verificar sua sessão. Confira a conexão com a API e tente novamente.');
    } finally { clearTimeout(timeout); if (current === revision.current) setReady(true); }
  }, []);
  useEffect(() => {
    // Sincroniza a sessão com a API e o armazenamento externo, de forma assíncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
    return subscribeSessionExpired(() => {
      setAccessToken(null); setUser(null); void removeToken().catch(() => {});
    });
  }, [restore]);
  async function signIn(email: string, senha: string) {
    ++revision.current;
    const session = await solicitarApi<Session>(`/auth/entrar${Platform.OS === 'web' ? '?usarCookie=true' : ''}`, {
      method: 'POST', body: { email: email.trim(), senha },
    });
    setAccessToken(session.token);
    try { if (session.token) await storeToken(session.token); }
    catch {
      try { await solicitarApi('/auth/sair', { method: 'POST', autenticado: true }); } finally { setAccessToken(null); }
      throw new Error('Não foi possível salvar a sessão com segurança neste dispositivo. Tente novamente.');
    }
    setUser(session.usuario); setError(null); setReady(true);
  }
  async function signOut() {
    try { await solicitarApi('/auth/sair', { method: 'POST', autenticado: true }); }
    catch (cause) { if (!(cause instanceof ApiError && cause.status === 401)) throw cause; }
    ++revision.current;
    setAccessToken(null); setUser(null); setError(null);
    await removeToken();
  }
  return <Context.Provider value={{ user, ready, error, signIn, signOut, restore }}>{children}</Context.Provider>;
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error('AuthProvider ausente.');
  return context;
}
