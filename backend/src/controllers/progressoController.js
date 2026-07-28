import { Progresso, Avaliacao, InteracaoChat } from '../models/index.js';

export async function obter(req, res) {
  try {
    const progresso = await Progresso.findOne({ where: { id_aluno: req.usuario.id } });
    return res.json({ status: 'SUCESSO', progresso });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function graficos(req, res) {
  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { id_aluno: req.usuario.id },
      attributes: ['id', 'nota_total', 'tipo', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    const chatCount = await InteracaoChat.count({
      where: { id_aluno: req.usuario.id },
    });

    const progresso = await Progresso.findOne({ where: { id_aluno: req.usuario.id } });

    return res.json({
      status: 'SUCESSO',
      dados: {
        avaliacoes,
        totalInteracoesChat: chatCount,
        xpTotal: progresso?.xp_total || 0,
        nivel: progresso?.nivel || 'iniciante',
        badges: progresso?.badges || [],
        evolucao: progresso?.dados_evolucao || {},
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}
