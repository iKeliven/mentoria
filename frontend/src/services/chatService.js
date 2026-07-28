import { getAIHeaders } from "./aiService";
import { API_URL, authHeaders } from './api';

function headers() {
  return authHeaders(getAIHeaders());
}

export const chatService = {
  perguntar: async (pergunta, id_trilha = null) => {
    try {
      const body = { pergunta };
      if (id_trilha) body.id_trilha = id_trilha;

      const res = await fetch(`${API_URL}chat/perguntar`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.status === "ERRO") {
        return { status: "ERRO", mensagem: data.mensagem || "Desculpe, ocorreu um erro ao processar sua pergunta." };
      }

      return data;
    } catch (e) {
      return { status: "ERRO", mensagem: "Erro de conexao com o servidor." };
    }
  },

  historico: async () => {
    try {
      const res = await fetch(`${API_URL}chat/historico`, { headers: headers() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  limparHistorico: async () => {
    try {
      const res = await fetch(`${API_URL}chat/historico`, {
        method: "DELETE",
        headers: headers(),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
