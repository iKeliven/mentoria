import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Aula = sequelize.define('Aula', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  conteudo_html: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  duracao_estimada: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'aulas',
  timestamps: true,
});

export default Aula;
