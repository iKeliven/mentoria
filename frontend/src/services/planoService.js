import { API_URL, authHeaders } from './api';

export const planoService = {
  visualizar: async () => {
    try {
      const res = await fetch(`${API_URL}plano`, { headers: authHeaders() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  gerar: async (id_trilha) => {
    try {
      const res = await fetch(`${API_URL}plano/gerar`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id_trilha }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
