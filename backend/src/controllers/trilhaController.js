import { Trilha, Competencia, Topico, ConteudoTrilha, Aula } from '../models/index.js';
import { completar, validarContextoProgramacao, extractAIConfig } from '../config/aiService.js';
import { criarPlanoFallback, criarQuestoesFallback } from '../utils/questionarioFallback.js';

export async function listar(req, res) {
  try {
    const id_aluno = req.usuario.id;
    const trilhas = await Trilha.findAll({
      where: { id_aluno },
      include: [Competencia, ConteudoTrilha],
    });
    return res.json({ status: 'SUCESSO', trilhas });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function criar(req, res) {
  try {
    const { nome, area, nvl, descricao } = req.body;
    console.log('[CRIAR_TRILHA]', { nome, area, nvl, descricao });

    if (!nome || !area || !nvl) {
      return res.status(400).json({ status: 'ERRO', mensagem: 'Campos obrigatorios' });
    }

    const aiConfig = extractAIConfig(req);
    const validacao = await validarContextoProgramacao(`${nome} ${area} ${descricao || ''}`, aiConfig);
    if (!validacao.valido) {
      return res.status(400).json({ status: 'ERRO', mensagem: validacao.mensagem });
    }

    const trilha = await Trilha.create({ nome, area, nvl, descricao, id_aluno: req.usuario.id });

    return res.status(201).json({ status: 'SUCESSO', trilha });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, area, nvl, descricao } = req.body;

    const trilha = await Trilha.findByPk(id);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    await trilha.update({ nome, area, nvl, descricao });
    return res.json({ status: 'SUCESSO', trilha });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function excluir(req, res) {
  try {
    const { id } = req.params;
    const id_aluno = req.usuario.id;

    const trilha = await Trilha.findByPk(id);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    if (trilha.id_aluno !== id_aluno) {
      return res.status(403).json({ status: 'ERRO', mensagem: 'Acesso negado' });
    }

    await ConteudoTrilha.destroy({ where: { id_trilha: id } });
    await Aula.destroy({ where: { id_trilha: id } });
    await trilha.destroy();

    return res.json({ status: 'SUCESSO', mensagem: 'Trilha excluida' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function selecionar(req, res) {
  try {
    const { id_trilha } = req.body;
    const id_aluno = req.usuario.id;

    const trilha = await Trilha.findByPk(id_trilha);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    await trilha.update({ id_aluno });
    return res.json({ status: 'SUCESSO', mensagem: 'Trilha selecionada' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function gerarQuestionario(req, res) {
  try {
    const { id } = req.params;
    const aiConfig = extractAIConfig(req);

    const trilha = await Trilha.findByPk(id);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    const prompt = `Gere exatamente 20 questoes de multipla escolha sobre "${trilha.nome}" (programacao/tecnologia) para nivel "${trilha.nvl}".
Cada questao deve ter 4 opcoes (indices 0 a 3).
Distribua a resposta correta entre os quatro indices; nao use sempre a primeira opcao.
As 20 questoes devem ser diferentes e progredir de iniciante para intermediario e avancado.
Retorne APENAS um JSON array valido sem formatacao extra, no formato:
[{"enunciado": "...", "opcoes": ["a", "b", "c", "d"], "resposta_correta": 0}]`;

    let questoes;
    try {
      const texto = await completar({ ...aiConfig, prompt, temperature: 0.7 });
      questoes = JSON.parse(texto.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.warn('[TRILHA] IA indisponivel; usando questionario local:', error.message);
      questoes = criarQuestoesFallback(20, trilha.area || trilha.nome);
    }

    return res.json({ status: 'SUCESSO', questoes });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao gerar questionario' });
  }
}

export async function responderQuestionario(req, res) {
  try {
    const { id } = req.params;
    const { respostas } = req.body;
    const aiConfig = extractAIConfig(req);

    if (!respostas || !Array.isArray(respostas)) {
      return res.status(400).json({ status: 'ERRO', mensagem: 'Respostas obrigatorias' });
    }

    const trilha = await Trilha.findByPk(id);
    if (!trilha) {
      return res.status(404).json({ status: 'ERRO', mensagem: 'Trilha nao encontrada' });
    }

    const acertos = respostas.filter((resposta) => resposta.correta === true).length;
    const total = respostas.length;
    const nota = total > 0 ? Number(((acertos / total) * 10).toFixed(1)) : 0;
    const nivelFinal = nota >= 8 ? 'avancado' : nota >= 5 ? 'intermediario' : 'iniciante';

    const questoesRespostas = respostas.map((r, i) =>
      `Q${i + 1}: ${r.enunciado}\nResposta: ${r.resposta} (${r.correta ? 'Correta' : 'Incorreta'})`
    ).join('\n\n');

    const prompt = `Com base nas respostas do aluno ao questionario sobre "${trilha.nome}" (nivel ${nivelFinal}, focado em programacao/tecnologia):

${questoesRespostas}

Crie um plano de aprendizado personalizado em exatamente 3 modulos: Fundamentos, Pratica aplicada e Projeto.
Retorne APENAS um JSON valido sem formatacao extra, no formato:
{
  "resumo": "Resumo conciso da trilha para que uma IA consiga entender todo o contexto (max 500 caracteres)",
  "abas": [
    {"titulo": "Nome da Aba 1", "conteudo": "<h3>Introducao</h3><p>Conteudo completo formatado em HTML simples para esta aba</p>"},
    {"titulo": "Nome da Aba 2", "conteudo": "<h3>Topicos</h3><p>Conteudo completo...</p>"}
  ]
}

O resumo deve ser extremamente conciso (max 500 caracteres) para ser usado como contexto rapido pela IA.
Cada modulo deve ter titulo curto e conteudo completo formatado em HTML simples (tags <h3>, <p>, <ul>, <li>, <strong>).
Em cada modulo, informe: objetivo de aprendizagem, explicacao clara dos conceitos, um exemplo pratico e tres atividades concretas. A duracao deve ser estimada individualmente conforme a complexidade e o nivel do aluno (entre 15 e 90 minutos); nao use sempre o mesmo tempo. Escreva cada atividade em um item <li> no formato "Nome da atividade — XX min".
O conteudo deve ser didatico, especifico para "${trilha.nome}", adaptado ao nivel ${nivelFinal} do aluno e baseado nos erros e acertos do questionario.
O conteudo DEVE ser exclusivamente sobre programacao e tecnologia.`;

    let dados;
    try {
      const texto = await completar({ ...aiConfig, prompt, temperature: 0.7 });
      dados = JSON.parse(texto.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.warn('[TRILHA] IA indisponivel; usando plano local:', error.message);
      dados = criarPlanoFallback(trilha);
    }

    await trilha.update({
      resumo: dados.resumo || '',
      nota_avaliacao: nota,
      acertos_avaliacao: acertos,
      total_avaliacao: total,
      nvl: nivelFinal,
    });

    if (dados.abas && Array.isArray(dados.abas)) {
      await ConteudoTrilha.destroy({ where: { id_trilha: trilha.id } });
      await Aula.destroy({ where: { id_trilha: trilha.id } });

      for (let i = 0; i < dados.abas.length; i++) {
        await ConteudoTrilha.create({
          id_trilha: trilha.id,
          titulo_aba: dados.abas[i].titulo,
          conteudo_html: dados.abas[i].conteudo,
          ordem: i,
        });

        const tempoEstimado = Math.floor(Math.random() * 76) + 15;
        await Aula.create({
          id_trilha: trilha.id,
          titulo: dados.abas[i].titulo,
          conteudo_html: dados.abas[i].conteudo,
          duracao_estimada: `${tempoEstimado} min`,
        });
      }
    }

    const completa = await Trilha.findByPk(trilha.id, { include: [ConteudoTrilha] });
    return res.json({ status: 'SUCESSO', trilha: completa, nota, acertos, total, nivel: nivelFinal });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao processar respostas' });
  }
}
