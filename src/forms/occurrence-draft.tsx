import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import type { CategoriaOcorrencia } from '../types/ocorrencia';
export interface OccurrenceFields {
  titulo: string; categoria: CategoriaOcorrencia | ''; descricao: string;
  uf: string; cidade: string; bairro: string; localizacao: string;
}
export const emptyFields: OccurrenceFields = {
  titulo: '', categoria: '', descricao: '', uf: '', cidade: '', bairro: '', localizacao: '',
};
const Context = createContext<{
  drafts: Record<string, OccurrenceFields>;
  setDraft: (key: string, field: keyof OccurrenceFields, value: string) => void;
  initialize: (key: string, fields: OccurrenceFields) => void;
  clear: (key: string) => void;
} | null>(null);

// Apenas memória: cada conta e cada operação têm um rascunho independente.
export function OccurrenceDraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, OccurrenceFields>>({});
  const setDraft = useCallback((key: string, field: keyof OccurrenceFields, value: string) => {
    setDrafts(current => ({ ...current, [key]: { ...(current[key] ?? emptyFields), [field]: value } }));
  }, []);
  const initialize = useCallback((key: string, fields: OccurrenceFields) => {
    setDrafts(current => current[key] ? current : { ...current, [key]: fields });
  }, []);
  const clear = useCallback((key: string) => {
    setDrafts(current => { const next = { ...current }; delete next[key]; return next; });
  }, []);
  return <Context.Provider value={{ drafts, setDraft, initialize, clear }}>{children}</Context.Provider>;
}
export function useOccurrenceDraft(scope = 'novo') {
  const value = useContext(Context); const { user } = useAuth();
  if (!value) throw new Error('OccurrenceDraftProvider ausente.');
  const key = user ? `${user.id}:${scope}` : null;
  const setDraft = value.setDraft; const initializeDraft = value.initialize; const clearDraft = value.clear;
  const update = useCallback((field: keyof OccurrenceFields, text: string) => {
    if (key) setDraft(key, field, text);
  }, [key, setDraft]);
  const initialize = useCallback((fields: OccurrenceFields) => {
    if (key) initializeDraft(key, fields);
  }, [key, initializeDraft]);
  const clear = useCallback(() => { if (key) clearDraft(key); }, [key, clearDraft]);
  return { fields: key ? value.drafts[key] ?? emptyFields : emptyFields, update, initialize, clear };
}
