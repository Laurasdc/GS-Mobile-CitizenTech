import type { OcorrenciaDetalhe, OcorrenciaResumo } from "../types/ocorrencia";

import { consultarApi } from "./api";

export interface FiltrosOcorrencias {
  uf?: string;
  cidade?: string;
  bairro?: string;
  categoria?: string;
  status?: string;
}

export function listarOcorrencias(
  signal?: AbortSignal,
  filtros: FiltrosOcorrencias = {},
): Promise<OcorrenciaResumo[]> {
  const parametros: string[] = [];

  const uf = filtros.uf?.trim().toUpperCase();
  const cidade = filtros.cidade?.trim();
  const bairro = filtros.bairro?.trim();

  if (uf) {
    parametros.push(`uf=${encodeURIComponent(uf)}`);
  }

  if (cidade) {
    parametros.push(`cidade=${encodeURIComponent(cidade)}`);
  }

  if (bairro) {
    parametros.push(`bairro=${encodeURIComponent(bairro)}`);
  }

  if (filtros.categoria) {
    parametros.push(`categoria=${encodeURIComponent(filtros.categoria)}`);
  }

  if (filtros.status) {
    parametros.push(`status=${encodeURIComponent(filtros.status)}`);
  }

  const query = parametros.length > 0 ? `?${parametros.join("&")}` : "";

  return consultarApi<OcorrenciaResumo[]>(`/ocorrencias${query}`, signal);
}

export function obterOcorrencia(
  id: string,
  signal?: AbortSignal,
): Promise<OcorrenciaDetalhe> {
  return consultarApi<OcorrenciaDetalhe>(
    `/ocorrencias/${encodeURIComponent(id)}`,
    signal,
  );
}
