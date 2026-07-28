import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Competencia = sequelize.define('Competencia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'competencias',
  timestamps: true,
});

export default Competencia;
