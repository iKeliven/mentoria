import { getAIHeaders } from "./aiService";
import { API_URL, authHeaders } from './api';

function headers() {
  return authHeaders(getAIHeaders());
}

export const avaliacaoService = {
  gerar: async (id_trilha, tipo = "diagnostica") => {
    try {
      const res = await fetch(`${API_URL}avaliacao/gerar`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id_trilha, tipo }),
      });
      const data = await res.json();

      if (data.status === "ERRO") return data;

      return {
        status: "SUCESSO",
        id_avaliacao: data.avaliacao.id,
        questoes: data.avaliacao.Questoes.map((q) => ({
          id: q.id,
          enunciado: q.enunciado,
          opcoes: q.opcoes,
          nivel: q.nivel_dificuldade,
        })),
      };
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  responder: async (id_avaliacao, respostas) => {
    try {
      const res = await fetch(`${API_URL}avaliacao/responder`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id_avaliacao, respostas }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  historico: async () => {
    try {
      const res = await fetch(`${API_URL}avaliacao/historico`, { headers: headers() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
