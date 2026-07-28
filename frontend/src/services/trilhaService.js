import { getAIHeaders } from "./aiService";
import { API_URL, authHeaders } from './api';

function headers() {
  return authHeaders(getAIHeaders());
}

export const trilhaService = {
  listar: async () => {
    try {
      const res = await fetch(`${API_URL}trilhas`, { headers: headers() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  criar: async (dados) => {
    try {
      const res = await fetch(`${API_URL}trilhas`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(dados),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  selecionar: async (id_trilha) => {
    try {
      const res = await fetch(`${API_URL}trilhas/selecionar`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id_trilha }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  gerarQuestionario: async (id_trilha) => {
    try {
      const res = await fetch(`${API_URL}trilhas/${id_trilha}/gerar-questionario`, {
        method: "POST",
        headers: headers(),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  responderQuestionario: async (id_trilha, respostas) => {
    try {
      const res = await fetch(`${API_URL}trilhas/${id_trilha}/responder-questionario`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ respostas }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  excluir: async (id) => {
    try {
      const res = await fetch(`${API_URL}trilhas/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  obterConteudo: async () => {
    try {
      const res = await fetch(`${API_URL}trilhas`, { headers: headers() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
