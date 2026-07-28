import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Progresso = sequelize.define('Progresso', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  xp_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  nivel: {
    type: DataTypes.STRING,
  },
  dados_evolucao: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'progresso',
  timestamps: true,
});

export default Progresso;
