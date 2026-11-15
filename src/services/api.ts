import { Platform } from 'react-native';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5239/api').replace(/\/$/, '');
let accessToken: string | null = null;
let sessionVersion = 0;
const expiredListeners = new Set<() => void>();
export function setAccessToken(token: string | null) { sessionVersion++; accessToken = token; }
export function subscribeSessionExpired(callback: () => void) {
  expiredListeners.add(callback);
  return () => { expiredListeners.delete(callback); };
}
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function solicitarApi<T>(caminho: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'; body?: unknown; signal?: AbortSignal; autenticado?: boolean;
} = {}): Promise<T> {
  const requestVersion = sessionVersion;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken && options.autenticado) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(`${API_URL}${caminho}`, {
    method: options.method ?? 'GET', headers, signal: options.signal,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    if (response.status === 401 && options.autenticado && requestVersion === sessionVersion) expiredListeners.forEach(listener => listener());
    let message = response.status === 401 ? 'Sua sessão terminou. Entre novamente para continuar.'
      : response.status === 429 ? 'Muitas tentativas. Aguarde um minuto e tente novamente.'
        : `Não foi possível concluir a solicitação (${response.status}).`;
    try {
      const problem = await response.json();
      const validation = problem.errors ? Object.values(problem.errors).flat().find(value => typeof value === 'string') : null;
      message = problem.detail || validation || problem.title || message;
    } catch { /* Respostas sem JSON mantêm a mensagem padrão. */ }
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function consultarApi<T>(caminho: string, signal?: AbortSignal) {
  return solicitarApi<T>(caminho, { signal });
}
