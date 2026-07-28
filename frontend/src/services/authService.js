import { API_URL, authHeaders } from './api';

export const authService = {
  alterarSenha: async (senhaAntiga, senhaNova) => {
    try {
      const res = await fetch(`${API_URL}usuario/alterar-senha`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ senhaAntiga, senhaNova }),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },

  apagarDados: async () => {
    try {
      const res = await fetch(`${API_URL}usuario/dados`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
