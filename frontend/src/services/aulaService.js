import { getAIHeaders } from "./aiService";
import { API_URL, authHeaders } from './api';

function headers() {
  return authHeaders(getAIHeaders());
}

export const aulaService = {
  criar: async (id_trilha, titulo_aba, conteudo_html) => {
    try {
      const res = await fetch(`${API_URL}aulas`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id_trilha, titulo_aba, conteudo_html }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  listar: async (id_trilha) => {
    try {
      const query = id_trilha ? `?id_trilha=${id_trilha}` : "";
      const res = await fetch(`${API_URL}aulas${query}`, { headers: headers() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  excluir: async (id) => {
    try {
      const res = await fetch(`${API_URL}aulas/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
