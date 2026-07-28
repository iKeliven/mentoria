import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  opcoes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  resposta_correta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nivel_dificuldade: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
});

export default Questao;
