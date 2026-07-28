import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConteudoTrilha = sequelize.define('ConteudoTrilha', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_trilha: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo_aba: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  conteudo_html: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ordem: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  embedding: {
    // A coluna e criada como vector(768) pelo inicializador do pgvector.
    // O Sequelize a lê como texto; as operações de similaridade ficam no PostgreSQL.
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'conteudos_trilha',
  timestamps: true,
});

export default ConteudoTrilha;
