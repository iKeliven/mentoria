import { API_URL, authHeaders } from './api';

export function getAIHeaders() {
  const config = getAIConfig();
  const h = { "x-ai-provider": "gemini" };
  if (config.apiKey && config.provider === "gemini") h["x-ai-api-key"] = config.apiKey;
  if (config.model) h["x-ai-model"] = config.model;
  return h;
}

export function getAIConfig() {
  try {
    const config = JSON.parse(localStorage.getItem("aiConfig") || "{}");
    return config.provider && config.provider !== "gemini"
      ? { provider: "gemini", model: "gemini-2.0-flash" }
      : config;
  } catch {
    return {};
  }
}

export function saveAIConfig(config) {
  localStorage.setItem("aiConfig", JSON.stringify(config));
}

export function getDefaultModel(provider) {
  return "gemini-2.0-flash";
}

export const aiService = {
  listarModelos: async () => {
    try {
      const res = await fetch(`${API_URL}ia/modelos`, { headers: authHeaders() });
      return await res.json();
    } catch (e) {
      return { status: "ERRO" };
    }
  },
};
