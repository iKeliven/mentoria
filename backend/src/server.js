import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import sequelize from './config/database.js';
import './models/index.js';
import router from './routes/index.js';
import { initPgVector } from './utils/pgvector.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
let pgvectorReady = false;

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(router);

app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'SUCESSO', database: 'conectado', pgvector: pgvectorReady });
  } catch {
    res.status(503).json({ status: 'ERRO', database: 'indisponivel', pgvector: false });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await sequelize.query('ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS nota_avaliacao FLOAT;');
    await sequelize.query('ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS acertos_avaliacao INTEGER;');
    await sequelize.query('ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS total_avaliacao INTEGER;');
    pgvectorReady = await initPgVector();
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  } catch (error) {
    console.error('Nao foi possivel iniciar o servidor:', error.parent?.message || error.message || error.name);
    process.exit(1);
  }
}

start();
