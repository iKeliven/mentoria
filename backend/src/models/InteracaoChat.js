import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InteracaoChat = sequelize.define('InteracaoChat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pergunta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resposta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'interacoes_chat',
  timestamps: true,
});

export default InteracaoChat;
