import { API_URL } from './api';

const url = API_URL;
const SESSION_KEY = "dadosDeSessao";
const TOKEN_KEY = "token";

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function getHeaders() {
  const token = getStorage()?.getItem(TOKEN_KEY);
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${url}${path}`, {
      ...options,
      signal: controller.signal,
    });

    const data = await response.json();
    return { response, data };
  } catch (e) {
    console.log(e);
    return { response: null, data: null };
  } finally {
    clearTimeout(timer);
  }
}

export const userService = {
  cadastrarUsuario: async (user) => {
    const { response, data } = await requestJson("usuario/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (response && response.ok && data) {
      return data;
    }

    return data || { status: "ERRO", mensagem: "Nao foi possivel conectar ao servidor." };
  },

  logarUsuario: async (user) => {
    const { response, data } = await requestJson("usuario/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
      credentials: "include",
    });

    if (response && response.ok && data) {
      const storage = getStorage();
      if (storage) {
        storage.setItem(TOKEN_KEY, data.token);
        storage.setItem(SESSION_KEY, JSON.stringify(data.dadosDeSessao));
      }
      return data;
    }

    return data || { status: "ERRO", mensagem: "Nao foi possivel conectar ao servidor." };
  },

  validarSessao: async () => {
    const token = getStorage()?.getItem(TOKEN_KEY);
    if (!token) return { status: "NAO_AUTORIZADO" };

    const { response, data } = await requestJson("usuario/auth/perfil", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (response && response.ok && data) {
      return data;
    }

    return { status: "NAO_AUTORIZADO" };
  },
};
