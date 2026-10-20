import { Sequelize } from 'sequelize';
import 'dotenv/config';

const options = {
  dialect: 'postgres',
  logging: false,
  ...(process.env.DB_SSL === 'true' ? { dialectOptions: { ssl: { require: true } } } : {}),
};

const sequelize = process.env.DATABASE_URL ? new Sequelize(process.env.DATABASE_URL, options) : new Sequelize(
  process.env.DB_NAME || 'mentoria',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS ?? process.env.DB_PASSWORD ?? 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    ...options,
  }
);

export default sequelize;
