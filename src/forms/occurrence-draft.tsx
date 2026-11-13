import { createContext, useContext, useState, type ReactNode } from 'react';
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
  fields: OccurrenceFields;
  update: (key: keyof OccurrenceFields, value: string) => void;
  clear: () => void;
} | null>(null);

// Rascunho apenas em memória, identificado pela conta. Sobrevive à ida ao login,
// sem expor os campos a outra conta ou gravar endereços no armazenamento local.
export function OccurrenceDraftProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<{ owner: string; fields: OccurrenceFields } | null>(null);
  const fields = user && draft?.owner === user.id ? draft.fields : emptyFields;
  function update(key: keyof OccurrenceFields, value: string) {
    if (!user) return;
    setDraft(current => ({ owner: user.id, fields: {
      ...(current?.owner === user.id ? current.fields : emptyFields), [key]: value,
    } }));
  }
  return <Context.Provider value={{ fields, update, clear: () => setDraft(null) }}>{children}</Context.Provider>;
}
export function useOccurrenceDraft() {
  const value = useContext(Context);
  if (!value) throw new Error('OccurrenceDraftProvider ausente.');
  return value;
}
