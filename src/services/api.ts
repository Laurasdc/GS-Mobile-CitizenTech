const API_URL = "http://localhost:5239/api";

interface ApiProblem {
  detail?: string;
  title?: string;
}

export async function consultarApi<T>(
  caminho: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_URL}${caminho}`, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    let mensagem = `Não foi possível consultar os dados (${response.status}).`;

    try {
      const erro: ApiProblem = await response.json();
      mensagem = erro.detail || erro.title || mensagem;
    } catch {
      // Mantém a mensagem padrão se a resposta não contiver JSON.
    }

    throw new Error(mensagem);
  }

  return (await response.json()) as T;
}
