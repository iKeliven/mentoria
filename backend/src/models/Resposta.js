import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resposta = sequelize.define('Resposta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  resposta: {
    type: DataTypes.INTEGER,
  },
  nota: {
    type: DataTypes.FLOAT,
  },
  feedback: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'respostas',
  timestamps: true,
});

export default Resposta;
