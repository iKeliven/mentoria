import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PlanoEnsino = sequelize.define('PlanoEnsino', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conteudo_prioritario: {
    type: DataTypes.JSON,
  },
  metas: {
    type: DataTypes.JSON,
  },
  data_geracao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'planos_ensino',
  timestamps: true,
});

export default PlanoEnsino;
