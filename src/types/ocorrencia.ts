export type CategoriaOcorrencia =
  | "Iluminacao"
  | "LixoAcumulado"
  | "Buraco"
  | "CalcadaDanificada";

export type StatusOcorrencia =
  | "Registrada"
  | "EmAnalise"
  | "EmAcompanhamento"
  | "Encerrada";

export interface OcorrenciaResumo {
  id: string;
  titulo: string;
  bairro: string;
  cidade: string;
  uf: string;
  categoria: CategoriaOcorrencia;
  status: StatusOcorrencia;
  criadoEm: string;
  atualizadoEm: string;
}

export interface HistoricoAtualizacao {
  id: string;
  statusAnterior: StatusOcorrencia;
  novoStatus: StatusOcorrencia;
  justificativa: string;
  criadoEm: string;
}

export interface OcorrenciaDetalhe extends OcorrenciaResumo {
  usuarioId: string;
  descricao: string;
  localizacao: string;
  totalConfirmacoes: number;
  historico: HistoricoAtualizacao[];
}

export const categoriasLabel: Record<CategoriaOcorrencia, string> = {
  Iluminacao: "Iluminação",
  LixoAcumulado: "Lixo acumulado",
  Buraco: "Buraco",
  CalcadaDanificada: "Calçada danificada",
};

export const statusLabel: Record<StatusOcorrencia, string> = {
  Registrada: "Registrada",
  EmAnalise: "Em análise",
  EmAcompanhamento: "Em acompanhamento",
  Encerrada: "Encerrada",
};
