import { Aula, Trilha, ConteudoTrilha } from '../models/index.js';
import { completar, extractAIConfig } from '../config/aiService.js';

export async function criar(req, res) {
  try {
    const { id_trilha, titulo_aba, conteudo_html } = req.body;
    const id_aluno = req.usuario.id;
    const aiConfig = extractAIConfig(req);

    if (!id_trilha || !titulo_aba || !conteudo_html) {
      return res.status(400).json({ status: 'ERRO', mensagem: 'Campos obrigatorios' });
    }

    const trilha = await Trilha.findByPk(id_trilha);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    if (trilha.id_aluno !== id_aluno) {
      return res.status(403).json({ status: 'ERRO', mensagem: 'Acesso negado' });
    }

    const prompt = `Voce e um professor virtual de programacao e tecnologia. Com base no conteudo abaixo sobre "${trilha.nome}" (nivel ${trilha.nvl}), crie uma aula completa e didatica.

Conteudo do topico "${titulo_aba}":
${conteudo_html}

Retorne APENAS um JSON valido sem formatacao extra, no formato:
{
  "titulo": "Titulo da aula",
  "conteudo_html": "<h3>Titulo</h3><p>Conteudo completo da aula formatado em HTML</p><h3>Topico 1</h3><p>...</p>",
  "duracao_estimada": "XX min"
}

O conteudo_html deve ser completo, didatico, adaptado ao nivel ${trilha.nvl}, e incluir explicacoes detalhadas, exemplos praticos e resumos. Use tags HTML simples como <h3>, <p>, <ul>, <li>, <strong>, <em>.
A duracao_estimada deve ser realista baseada no volume de conteudo (entre 10 e 60 minutos).
O conteudo DEVE ser exclusivamente sobre programacao e tecnologia.`;

    const texto = await completar({ ...aiConfig, prompt, temperature: 0.7 });
    const dados = JSON.parse(texto.replace(/```json|```/g, '').trim());

    const aula = await Aula.create({
      id_trilha,
      titulo: dados.titulo || titulo_aba,
      conteudo_html: dados.conteudo_html || conteudo_html,
      duracao_estimada: dados.duracao_estimada || '15 min',
    });

    return res.status(201).json({ status: 'SUCESSO', aula });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao criar aula' });
  }
}

export async function listar(req, res) {
  try {
    const id_aluno = req.usuario.id;
    const { id_trilha } = req.query;

    const trilhas = await Trilha.findAll({ where: { id_aluno }, attributes: ['id'] });
    const trilhaIds = trilhas.map((t) => t.id);

    if (trilhaIds.length === 0) {
      return res.json({ status: 'SUCESSO', aulas: [] });
    }

    const where = { id_trilha: trilhaIds };
    if (id_trilha) where.id_trilha = Number(id_trilha);

    const aulas = await Aula.findAll({
      where,
      include: [{
        model: Trilha,
        attributes: ['id', 'nome', 'nvl'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ status: 'SUCESSO', aulas });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function excluir(req, res) {
  try {
    const { id } = req.params;
    const id_aluno = req.usuario.id;

    const aula = await Aula.findByPk(id, { include: [Trilha] });
    if (!aula) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Aula nao encontrada' });
    }

    if (aula.Trilha.id_aluno !== id_aluno) {
      return res.status(403).json({ status: 'ERRO', mensagem: 'Acesso negado' });
    }

    await aula.destroy();
    return res.json({ status: 'SUCESSO', mensagem: 'Aula excluida' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}
