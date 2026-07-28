import { API_URL, authHeaders } from './api';

export const progressoService = {
  obter: async () => {
    try {
      const res = await fetch(`${API_URL}progresso`, { headers: authHeaders() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  graficos: async () => {
    try {
      const res = await fetch(`${API_URL}progresso/graficos`, { headers: authHeaders() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
