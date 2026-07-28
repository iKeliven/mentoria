import { Avaliacao, Questao, Resposta, Trilha, Progresso } from '../models/index.js';
import { completar, validarContextoProgramacao, extractAIConfig } from '../config/aiService.js';
import { criarQuestoesFallback } from '../utils/questionarioFallback.js';

export async function gerar(req, res) {
  try {
    const { id_trilha, tipo } = req.body;
    const id_aluno = req.usuario.id;
    const aiConfig = extractAIConfig(req);

    const trilha = await Trilha.findByPk(id_trilha);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    const validacao = await validarContextoProgramacao(trilha.area || trilha.nome, aiConfig);
    if (!validacao.valido) {
      return res.status(400).json({ status: 'ERRO', mensagem: validacao.mensagem });
    }

    const prompt = `Gere 20 questoes de multipla escolha sobre "${trilha.area}" (programacao/tecnologia) para nivel "${trilha.nvl}".
Cada questao deve ter 4 opcoes. Distribua a resposta correta entre os quatro indices e gere questoes distintas com dificuldade progressiva. Retorne APENAS um JSON array valido sem formatacao extra, no formato:
[{"enunciado": "...", "opcoes": ["a", "b", "c", "d"], "resposta_correta": 0, "nivel_dificuldade": "iniciante"}]`;

    let questoesData;
    try {
      const texto = await completar({ ...aiConfig, prompt });
      questoesData = JSON.parse(texto.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.warn('[AVALIACAO] IA indisponivel; usando questoes locais:', error.message);
      questoesData = criarQuestoesFallback(20, trilha.area || trilha.nome);
    }

    const avaliacao = await Avaliacao.create({
      id_aluno,
      id_trilha,
      tipo: tipo || 'diagnostica',
    });

    for (const q of questoesData) {
      await Questao.create({
        id_avaliacao: avaliacao.id,
        enunciado: q.enunciado,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        nivel_dificuldade: q.nivel_dificuldade,
      });
    }

    const completa = await Avaliacao.findByPk(avaliacao.id, { include: [{ model: Questao, as: 'Questoes' }] });
    return res.json({ status: 'SUCESSO', avaliacao: completa });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao gerar avaliacao' });
  }
}

export async function responder(req, res) {
  try {
    const { id_avaliacao, respostas } = req.body;
    const id_aluno = req.usuario.id;

    const avaliacao = await Avaliacao.findByPk(id_avaliacao, { include: [{ model: Questao, as: 'Questoes' }] });
    if (!avaliacao) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Avaliacao nao encontrada' });
    }

    let acertos = 0;
    const total = avaliacao.Questoes.length;

    for (const r of respostas) {
      const questao = avaliacao.Questoes.find((q) => q.id === r.id_questao);
      if (!questao) continue;

      const correta = questao.resposta_correta === r.resposta;
      if (correta) acertos++;

      await Resposta.create({
        id_aluno,
        id_questao: questao.id,
        resposta: r.resposta,
        nota: correta ? 10 : 0,
        feedback: correta ? 'Correto!' : 'Incorreto.',
      });
    }

    const notaFinal = (acertos / total) * 10;
    let nivel = 'iniciante';
    if (notaFinal >= 7) nivel = 'avancado';
    else if (notaFinal >= 4) nivel = 'intermediario';

    await avaliacao.update({ nota_total: notaFinal, nivel_classificado: nivel });

    const progresso = await Progresso.findOne({ where: { id_aluno } });
    if (progresso) {
      const xpGanho = Math.round(notaFinal * 10);
      await progresso.update({
        xp_total: progresso.xp_total + xpGanho,
        nivel,
        dados_evolucao: { ...progresso.dados_evolucao, [`avaliacao_${avaliacao.id}`]: notaFinal },
      });
    }

    return res.json({
      status: 'SUCESSO',
      nota: notaFinal,
      nivel,
      acertos,
      total,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function historico(req, res) {
  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { id_aluno: req.usuario.id },
      include: [{ model: Questao, as: 'Questoes' }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ status: 'SUCESSO', avaliacoes });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}
