import sequelize from '../config/database.js';

export const EMBEDDING_DIMENSIONS = 768;

export async function initPgVector() {
  try {
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    await sequelize.query(`
      ALTER TABLE conteudos_trilha
      ADD COLUMN IF NOT EXISTS embedding vector(${EMBEDDING_DIMENSIONS});
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS conteudos_trilha_embedding_idx
      ON conteudos_trilha USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
    console.log('[PGVECTOR] Extensao, coluna e indice prontos');
    return true;
  } catch (error) {
    console.warn('[PGVECTOR] Indisponivel. Cadastro e demais recursos seguem ativos:', error.message);
    return false;
  }
}
