import User from './User.js';
import Trilha from './Trilha.js';
import Competencia from './Competencia.js';
import Topico from './Topico.js';
import Avaliacao from './Avaliacao.js';
import Questao from './Questao.js';
import Resposta from './Resposta.js';
import PlanoEnsino from './PlanoEnsino.js';
import InteracaoChat from './InteracaoChat.js';
import Progresso from './Progresso.js';
import ConteudoTrilha from './ConteudoTrilha.js';
import Aula from './Aula.js';

User.hasMany(Trilha, { foreignKey: 'id_aluno' });
Trilha.belongsTo(User, { foreignKey: 'id_aluno' });

Trilha.hasMany(Competencia, { foreignKey: 'id_trilha' });
Competencia.belongsTo(Trilha, { foreignKey: 'id_trilha' });

Competencia.hasMany(Topico, { foreignKey: 'id_competencia' });
Topico.belongsTo(Competencia, { foreignKey: 'id_competencia' });

User.hasMany(Avaliacao, { foreignKey: 'id_aluno' });
Avaliacao.belongsTo(User, { foreignKey: 'id_aluno' });

Trilha.hasMany(Avaliacao, { foreignKey: 'id_trilha' });
Avaliacao.belongsTo(Trilha, { foreignKey: 'id_trilha' });

Avaliacao.hasMany(Questao, { foreignKey: 'id_avaliacao', as: 'Questoes' });
Questao.belongsTo(Avaliacao, { foreignKey: 'id_avaliacao' });

User.hasMany(Resposta, { foreignKey: 'id_aluno' });
Resposta.belongsTo(User, { foreignKey: 'id_aluno' });

Questao.hasMany(Resposta, { foreignKey: 'id_questao' });
Resposta.belongsTo(Questao, { foreignKey: 'id_questao' });

User.hasOne(PlanoEnsino, { foreignKey: 'id_aluno' });
PlanoEnsino.belongsTo(User, { foreignKey: 'id_aluno' });

Trilha.hasMany(PlanoEnsino, { foreignKey: 'id_trilha' });
PlanoEnsino.belongsTo(Trilha, { foreignKey: 'id_trilha' });

User.hasMany(InteracaoChat, { foreignKey: 'id_aluno' });
InteracaoChat.belongsTo(User, { foreignKey: 'id_aluno' });

Trilha.hasMany(InteracaoChat, { foreignKey: 'id_trilha' });
InteracaoChat.belongsTo(Trilha, { foreignKey: 'id_trilha' });

User.hasOne(Progresso, { foreignKey: 'id_aluno' });
Progresso.belongsTo(User, { foreignKey: 'id_aluno' });

Trilha.hasMany(Progresso, { foreignKey: 'id_trilha' });
Progresso.belongsTo(Trilha, { foreignKey: 'id_trilha' });

Trilha.hasMany(ConteudoTrilha, { foreignKey: 'id_trilha' });
ConteudoTrilha.belongsTo(Trilha, { foreignKey: 'id_trilha' });

Trilha.hasMany(Aula, { foreignKey: 'id_trilha' });
Aula.belongsTo(Trilha, { foreignKey: 'id_trilha' });

export {
  User,
  Trilha,
  Competencia,
  Topico,
  Avaliacao,
  Questao,
  Resposta,
  PlanoEnsino,
  InteracaoChat,
  Progresso,
  ConteudoTrilha,
  Aula,
};
