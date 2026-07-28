import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Topico = sequelize.define('Topico', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'topicos',
  timestamps: true,
});

export default Topico;
