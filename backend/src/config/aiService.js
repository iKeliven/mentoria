import { GoogleGenerativeAI } from '@google/generative-ai';

export async function validarContextoProgramacao(texto, aiConfig) {
  if (!texto || !texto.trim()) {
    return { valido: false, mensagem: 'Conteudo vazio.' };
  }

  const prompt = `Analise o texto abaixo e responda APENAS com "SIM" ou "NAO".

O texto deve ser sobre programacao, desenvolvimento de software, ou tecnologia (como frameworks, linguagens, algoritmos, banco de dados, APIs, infraestrutura, etc).

Se NAO for sobre programacao/tecnologia, responda NAO.

Texto: "${texto.trim()}"`;

  try {
    const resultado = await completar({
      provider: aiConfig.provider,
      apiKey: aiConfig.apiKey,
      model: 'gemini-2.0-flash',
      prompt,
      temperature: 0,
    });

    const resposta = resultado.trim().toUpperCase();
    const isProgramming = resposta.includes('SIM') && !resposta.includes('NAO');

    console.log('[VALIDACAO]', { texto: texto.substring(0, 80), resposta: resultado.trim(), isProgramming });

    if (!isProgramming) {
      return {
        valido: false,
        mensagem: 'O conteudo informado nao esta relacionado a programacao ou tecnologia. Este site e exclusivamente para estudo de programacao, desenvolvimento de software e areas tech.',
      };
    }
    return { valido: true };
  } catch (e) {
    console.log('Erro na validacao de contexto:', e.message);
    return { valido: true };
  }
}

export async function completar({ provider, apiKey, model, prompt, temperature = 0.7 }) {
  return completarGemini({ apiKey, model, prompt, temperature });
}

async function completarGemini({ apiKey, model, prompt, temperature }) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash' });
  const result = await generativeModel.generateContent(prompt);
  return result.response.text() || '';
}

export const MODELOS_GEMINI = [
  { id: 'gemini-2.0-flash', nome: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-flash', nome: 'Gemini 2.5 Flash' },
  { id: 'gemini-1.5-flash', nome: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', nome: 'Gemini 1.5 Pro' },
];

export function extractAIConfig(req) {
  const apiKey = req.headers['x-ai-api-key'] && req.headers['x-ai-api-key'] !== 'undefined'
    ? req.headers['x-ai-api-key']
    : process.env.GEMINI_API_KEY;
  const model = req.headers['x-ai-model'] && req.headers['x-ai-model'] !== 'undefined'
    ? req.headers['x-ai-model']
    : 'gemini-2.0-flash';
  return { provider: 'gemini', apiKey, model };
}

export function getGeminiApiKey(aiConfig) {
  return aiConfig.provider === 'gemini' && aiConfig.apiKey
    ? aiConfig.apiKey
    : process.env.GEMINI_API_KEY;
}
