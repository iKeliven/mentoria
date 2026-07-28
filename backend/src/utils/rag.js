const EMBEDDING_DIMENSIONS = 768;

export function vectorToString(values) {
  return `[${values.map((value) => Number(value)).join(',')}]`;
}

export async function gerarEmbedding(texto, apiKey) {
  if (!apiKey) {
    throw new Error('Configure GEMINI_API_KEY ou informe uma chave Gemini nas configuracoes de IA.');
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(apiKey);
  const result = await client.getGenerativeModel({ model: 'text-embedding-004' }).embedContent({
    content: { parts: [{ text: String(texto || '') }] },
    taskType: 'RETRIEVAL_DOCUMENT',
  });
  const values = result.embedding?.values;

  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding Gemini invalido: eram esperadas ${EMBEDDING_DIMENSIONS} dimensoes.`);
  }
  return values;
}

export async function gerarEmbeddingConsulta(texto, apiKey) {
  if (!apiKey) {
    throw new Error('Configure GEMINI_API_KEY ou informe uma chave Gemini nas configuracoes de IA.');
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(apiKey);
  const result = await client.getGenerativeModel({ model: 'text-embedding-004' }).embedContent({
    content: { parts: [{ text: String(texto || '') }] },
    taskType: 'RETRIEVAL_QUERY',
  });
  const values = result.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding Gemini invalido: eram esperadas ${EMBEDDING_DIMENSIONS} dimensoes.`);
  }
  return values;
}
