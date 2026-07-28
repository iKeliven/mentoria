import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Avaliacao = sequelize.define('Avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.ENUM('diagnostica', 'progresso'),
    allowNull: false,
  },
  nota_total: {
    type: DataTypes.FLOAT,
  },
  nivel_classificado: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'avaliacoes',
  timestamps: true,
});

export default Avaliacao;
