import { PlanoEnsino, Trilha, Avaliacao, Resposta } from '../models/index.js';
import { completar, extractAIConfig } from '../config/aiService.js';

export async function visualizar(req, res) {
  try {
    const plano = await PlanoEnsino.findOne({
      where: { id_aluno: req.usuario.id },
      include: [Trilha],
    });

    if (!plano) {
      return res.json({ status: 'SUCESSO', plano: null });
    }

    return res.json({ status: 'SUCESSO', plano });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function gerar(req, res) {
  try {
    const { id_trilha } = req.body;
    const id_aluno = req.usuario.id;
    const aiConfig = extractAIConfig(req);

    const trilha = await Trilha.findByPk(id_trilha);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    const avaliacoes = await Avaliacao.findAll({
      where: { id_aluno, id_trilha },
      include: [Trilha],
    });

    const prompt = `Crie um plano de ensino personalizado para um aluno de nivel "${trilha.nvl}" na area "${trilha.area}".
${
  avaliacoes.length > 0
    ? `O aluno teve as seguintes notas: ${avaliacoes.map((a) => `${a.tipo}: ${a.nota_total}`).join(', ')}`
    : 'O aluno ainda nao fez avaliacoes.'
}
Retorne APENAS um JSON valido sem formatacao extra no formato:
{"conteudo_prioritario": ["topico1", "topico2"], "metas": ["meta1", "meta2"]}`;

    const texto = await completar({ ...aiConfig, prompt });
    const dados = JSON.parse(texto.replace(/```json|```/g, '').trim());

    const [plano] = await PlanoEnsino.upsert({
      id_aluno,
      id_trilha,
      conteudo_prioritario: dados.conteudo_prioritario || [],
      metas: dados.metas || [],
    });

    return res.json({ status: 'SUCESSO', plano });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao gerar plano' });
  }
}
