import { unidadesFederativas } from '../constants/localidades';
import { categoriasLabel } from '../types/ocorrencia';
import type { OccurrenceFields } from './occurrence-draft';
export type FieldErrors = Partial<Record<keyof OccurrenceFields, string>>;
export function validateOccurrence(fields: OccurrenceFields): FieldErrors {
  const errors: FieldErrors = {};
  const textFields = [
    ['titulo', 'Dê um título ao problema.', 120],
    ['descricao', 'Descreva o que está acontecendo.', 2000],
    ['cidade', 'Informe a cidade.', 100],
    ['bairro', 'Informe o bairro.', 100],
    ['localizacao', 'Informe o endereço ou um ponto de referência.', 250],
  ] as const;
  for (const [key, message, max] of textFields) {
    if (!fields[key].trim()) errors[key] = message;
    else if (fields[key].trim().length > max) errors[key] = `Use no máximo ${max} caracteres.`;
  }
  if (!fields.categoria || !Object.hasOwn(categoriasLabel, fields.categoria)) errors.categoria = 'Escolha o tipo de problema.';
  if (!unidadesFederativas.some(uf => uf.sigla === fields.uf)) errors.uf = 'Escolha o estado.';
  return errors;
}
