import sequelize from '../config/database.js';
import { InteracaoChat, Trilha, Progresso, ConteudoTrilha } from '../models/index.js';
import { completar, validarContextoProgramacao, extractAIConfig, getGeminiApiKey } from '../config/aiService.js';
import { gerarEmbedding, gerarEmbeddingConsulta, vectorToString } from '../utils/rag.js';

function removerHtml(texto = '') {
  return texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function atividadesDoPlano(conteudos = []) {
  return conteudos.flatMap((conteudo) => {
    const itens = Array.from(conteudo.conteudo_html?.matchAll(/<li[^>]*>(.*?)<\/li>/gi) || []);
    if (itens.length) return itens.map(([, texto]) => {
      const atividade = removerHtml(texto);
      const minutos = atividade.match(/(?:—|-)\s*(\d{1,3})\s*min/i)?.[1];
      return {
        modulo: conteudo.titulo_aba,
        titulo: atividade.replace(/\s*(?:—|-)\s*\d{1,3}\s*min/i, ''),
        duracao: minutos ? `${minutos} min` : '30 min',
      };
    });
    return [{ modulo: conteudo.titulo_aba, titulo: conteudo.titulo_aba, duracao: '30 min' }];
  });
}

function aulaBancoDeDados(pergunta) {
  const consulta = pergunta.toLowerCase();
  if (consulta.includes('normaliza')) {
    return `**5 exercícios sobre normalização de bancos de dados**\n\n1. **Identifique dados repetidos:** uma tabela \`PEDIDOS(id_pedido, cliente_nome, cliente_email, produto_nome, produto_preco)\` repete os dados do cliente e produto. Separe-a em tabelas até eliminar as repetições.\n\n2. **Primeira Forma Normal (1FN):** a tabela \`ALUNOS(id, nome, telefones)\` guarda \`(11) 99999-1111, (11) 98888-2222\` no mesmo campo. Modele tabelas para que cada coluna guarde apenas um valor.\n\n3. **Segunda Forma Normal (2FN):** \`ITEM_PEDIDO(id_pedido, id_produto, nome_produto, quantidade)\` usa chave composta. Explique qual coluna depende só de \`id_produto\` e mova-a para a tabela correta.\n\n4. **Terceira Forma Normal (3FN):** \`FUNCIONARIOS(id, nome, id_departamento, nome_departamento, gerente_departamento)\`. Identifique a dependência transitiva e crie as tabelas \`FUNCIONARIOS\` e \`DEPARTAMENTOS\`.\n\n5. **Projeto prático:** normalize uma planilha de biblioteca com: \`livro_titulo, autor_nome, autor_pais, categoria_nome, emprestimo_data, aluno_nome\`. Defina as tabelas, chaves primárias e estrangeiras.\n\n**Desafio:** resolva primeiro o exercício 2. Envie as tabelas e colunas que você criou; eu reviso a sua solução e explico qualquer ajuste.`;
  }
  if (consulta.includes('join')) {
    return `**JOIN em Banco de Dados**\n\nJOIN serve para combinar dados de tabelas relacionadas. Imagine uma tabela \`clientes\` e outra \`pedidos\`; cada pedido guarda o \`cliente_id\`.\n\nExemplo:\n\`SELECT clientes.nome, pedidos.total FROM clientes JOIN pedidos ON pedidos.cliente_id = clientes.id;\`\n\nIsso mostra o nome do cliente junto com o total de cada pedido.\n\n**Exercício (30 min):** crie as tabelas \`alunos\` e \`matriculas\`, insira dois alunos e escreva um JOIN que mostre aluno e curso.`;
  }
  if (consulta.includes('sql') || consulta.includes('select') || consulta.includes('consulta')) {
    return `**Consultas SQL com SELECT**\n\n\`SELECT\` lê dados de uma tabela. \`WHERE\` filtra apenas os registros desejados.\n\nExemplo:\n\`SELECT nome, email FROM alunos WHERE ativo = true;\`\n\nEsse comando retorna somente nome e e-mail dos alunos ativos.\n\n**Exercício (30 min):** em uma tabela \`produtos(id, nome, preco)\`, escreva uma consulta que liste nome e preço dos produtos com preço maior que 100.`;
  }
  return `**Conceito: Banco de Dados Relacional**\n\nUm banco de dados é um sistema para guardar informações de forma organizada e consultável. Em um banco relacional, os dados ficam em **tabelas**. Cada tabela representa uma entidade: por exemplo, \`alunos\`, \`cursos\` ou \`pedidos\`.\n\n- **Coluna:** uma característica, como \`nome\` ou \`email\`.\n- **Linha (registro):** uma informação completa, como um aluno específico.\n- **Chave primária:** identificador único, geralmente \`id\`.\n- **Chave estrangeira:** cria a ligação entre duas tabelas.\n\nExemplo:\n\`CREATE TABLE alunos (id SERIAL PRIMARY KEY, nome VARCHAR(100), email VARCHAR(120));\`\n\n**Exercício (30 min):** modele uma tabela \`livros\` com \`id\`, \`titulo\`, \`autor\` e \`ano_publicacao\`. Depois escreva um \`INSERT\` para cadastrar um livro.`;
}

function aulaFrontend(pergunta) {
  const consulta = pergunta.toLowerCase();
  if (consulta.includes('semânt') || consulta.includes('semant')) {
    return `**Conceito: HTML semântico**\n\nHTML semântico usa tags que explicam o papel do conteúdo. Isso melhora acessibilidade, SEO e manutenção.\n\nExemplo:\n\`<header><h1>Meu portfólio</h1></header>\`\n\`<main><article><h2>Projeto</h2><p>Descrição</p></article></main>\`\n\`<footer>Contato</footer>\`\n\nEm vez de usar apenas \`<div>\`, escolha \`header\`, \`main\`, \`article\`, \`nav\` e \`footer\` quando fizer sentido.\n\n**Exercício (30 min):** transforme uma página com três \`div\` em \`header\`, \`main\` e \`footer\`.`;
  }
  return `**Conceito: estrutura de uma página HTML**\n\nHTML define a estrutura do conteúdo. \`<h1>\` é o título principal, \`<p>\` cria parágrafos e \`<a>\` cria links.\n\nExemplo:\n\`<main><h1>Olá, mundo!</h1><p>Estou aprendendo Front-end.</p><a href=\"#projetos\">Ver projetos</a></main>\`\n\n**Exercício (30 min):** crie uma página com seu nome em um \`h1\`, uma breve apresentação em um \`p\` e um link para um projeto.`;
}

function respostaLocal(pergunta, nivel, trilha, conteudos = []) {
  const tema = trilha?.nome || 'programação';
  const atividades = atividadesDoPlano(conteudos);
  const consulta = pergunta.toLowerCase();

  if (!trilha) {
    return 'Para eu montar uma orientação realmente personalizada, selecione uma trilha no topo do chat. Assim eu uso o assunto, o nível e as atividades do seu plano.';
  }

  const bancoDeDados = `${trilha.nome} ${trilha.area || ''}`.toLowerCase().includes('banco') || `${trilha.nome} ${trilha.area || ''}`.toLowerCase().includes('dados');
  const frontend = `${trilha.nome} ${trilha.area || ''}`.toLowerCase().includes('front') || `${trilha.nome} ${trilha.area || ''}`.toLowerCase().includes('web');

  if (consulta.includes('sessão de estudo') || consulta.includes('estudo de hoje') || consulta.includes('o que estudar')) {
    const hoje = atividades.slice(0, 3);
    const roteiro = hoje.map((item, indice) => `${indice + 1}. ${item.titulo} — ${item.duracao} (${item.modulo}).`).join('\n');
    const total = hoje.reduce((soma, item) => soma + Number(item.duracao.replace(/\D/g, '')), 0);
    return `Plano de hoje para ${tema} (${nivel}):\n\n${roteiro}\n\nTempo estimado: ${total} min. Ao terminar cada etapa, anote uma dúvida ou um exemplo que você conseguiu fazer. O próximo passo é me enviar essa dúvida ou pedir a correção do seu exercício.`;
  }

  if (consulta.includes('progresso') || consulta.includes('avaliação') || consulta.includes('avaliacao')) {
    const nota = trilha.nota_avaliacao === null || trilha.nota_avaliacao === undefined
      ? 'Você ainda não tem uma nota registrada.'
      : `Sua avaliação mais recente foi ${Number(trilha.nota_avaliacao).toFixed(1)}/10 (${trilha.acertos_avaliacao}/${trilha.total_avaliacao} acertos).`;
    const proxima = atividades[0];
    return `Progresso em ${tema}:\n\n${nota}\nSeu nível atual é ${trilha.nvl}.\nPróximo foco: ${proxima ? `${proxima.titulo} — ${proxima.duracao}` : 'concluir a avaliação de nivelamento para gerar atividades.'}\n\nPara avançar de nível, conclua as atividades dos módulos, revise os erros da avaliação e faça a prova de progresso ao final do plano.`;
  }

  if (consulta.includes('o que estou estudando') || consulta.includes('minha trilha') || consulta.includes('o que estudo')) {
    const roteiro = atividades.slice(0, 6).map((item, indice) => `${indice + 1}. ${item.titulo} — ${item.duracao} (${item.modulo})`).join('\n');
    return `Você está estudando **${tema}** no nível ${nivel}. Seu plano atual é:\n\n${roteiro || 'A avaliação ainda não gerou as atividades do plano.'}\n\nComece pela primeira atividade e, quando terminar, marque-a como concluída em “Minhas trilhas”.`;
  }

  if (consulta.includes('quais') && (consulta.includes('conceito') || consulta.includes('conteúdo') || consulta.includes('conteudo') || consulta.includes('estudar'))) {
    if (bancoDeDados) {
      return `**Conceitos que você precisa estudar em Banco de Dados**\n\n1. **Modelagem de dados:** entidades, atributos e relacionamentos.\n2. **Tabelas, linhas, colunas e tipos de dados:** como estruturar as informações.\n3. **Chaves primárias e estrangeiras:** como identificar registros e relacionar tabelas.\n4. **SQL básico:** \`SELECT\`, \`WHERE\`, \`INSERT\`, \`UPDATE\` e \`DELETE\`.\n5. **Relacionamentos e JOIN:** como consultar dados que estão em tabelas diferentes.\n6. **Normalização:** como reduzir duplicações e inconsistências usando 1FN, 2FN e 3FN.\n7. **Projeto prático:** modelar e criar um banco no PostgreSQL.\n\n**Comece por:** modelagem de dados e chaves. Depois pratique \`CREATE TABLE\` e \`SELECT\`. Quando quiser, peça “me explique modelagem de dados” ou “faça exercícios de JOIN”.`;
    }
    if (frontend) {
      return `**Conceitos que você precisa estudar em Desenvolvimento Front-end**\n\n1. Estrutura HTML e tags principais.\n2. HTML semântico e acessibilidade.\n3. Textos, links, listas, imagens e formulários.\n4. CSS: seletores, cores, espaçamento e tipografia.\n5. Layout com Flexbox e Grid.\n6. Responsividade para celular e desktop.\n7. Projeto prático: construir uma página completa.\n\n**Comece por:** estrutura HTML e semântica. Depois faça uma página simples antes de avançar para CSS.`;
    }
    const roteiro = atividades.slice(0, 6).map((item, indice) => `${indice + 1}. **${item.titulo}** — ${item.duracao}`).join('\n');
    return `**Conceitos da sua trilha ${tema}:**\n\n${roteiro || 'Conclua a avaliação de nível para gerar os conceitos personalizados.'}\n\nComece pelo primeiro item e peça uma explicação ou exercícios sobre ele quando precisar.`;
  }

  if (bancoDeDados) return aulaBancoDeDados(pergunta);
  if (frontend) return aulaFrontend(pergunta);

  const proxima = atividades[0];
  return `Vamos focar em ${tema}, no nível ${nivel}.\n\nPróximo conceito sugerido: ${proxima?.titulo || 'os fundamentos da trilha'} (${proxima?.duracao || '30 min'}).\nComo estudar: leia o conceito por 10 minutos, reproduza um exemplo por 15 minutos e faça uma pequena variação por conta própria.\n\nEnvie sua dúvida com o trecho de código, a mensagem de erro ou o conceito específico; assim eu consigo explicar com exemplos da sua trilha.`;
}

export async function perguntar(req, res) {
  try {
    const { pergunta, id_trilha } = req.body;
    const id_aluno = req.usuario.id;
    const aiConfig = extractAIConfig(req);

    if (!pergunta) {
      return res.status(400).json({ status: 'ERRO', mensagem: 'Pergunta obrigatoria' });
    }

    const validacao = await validarContextoProgramacao(pergunta, aiConfig);
    if (!validacao.valido) {
      return res.status(400).json({ status: 'ERRO', mensagem: validacao.mensagem });
    }

    let contextoTrilha = '';
    let contextoRecuperado = [];
    let trilhaAtual = null;

    if (id_trilha) {
      const trilha = await Trilha.findByPk(id_trilha, {
        include: [ConteudoTrilha],
      });

      if (trilha) {
        trilhaAtual = trilha;
        const abas = (trilha.ConteudoTrilhas || [])
          .sort((a, b) => a.ordem - b.ordem)
          .map((a) => `${a.titulo_aba}: ${a.conteudo_html}`)
          .join('\n\n');

        const resultadoAvaliacao = trilha.nota_avaliacao === null || trilha.nota_avaliacao === undefined
          ? 'Avaliação ainda não concluída.'
          : `Nota ${trilha.nota_avaliacao}/10 (${trilha.acertos_avaliacao}/${trilha.total_avaliacao} acertos).`;
        contextoTrilha = `Contexto da trilha "${trilha.nome}" (nivel ${trilha.nvl}):
Resumo: ${trilha.resumo || 'Nao disponivel'}
Avaliação: ${resultadoAvaliacao}
Conteudo:
${abas || 'Nao disponivel'}

`;

        try {
          const geminiApiKey = getGeminiApiKey(aiConfig);
          const conteudos = trilha.ConteudoTrilhas || [];
          for (const conteudo of conteudos.filter((item) => !item.getDataValue('embedding'))) {
            const embedding = await gerarEmbedding(`${conteudo.titulo_aba}\n${conteudo.conteudo_html}`, geminiApiKey);
            await sequelize.query('UPDATE conteudos_trilha SET embedding = CAST(:embedding AS vector) WHERE id = :id', { replacements: { embedding: vectorToString(embedding), id: conteudo.id } });
          }
          const embeddingConsulta = await gerarEmbeddingConsulta(pergunta, geminiApiKey);
          const [resultados] = await sequelize.query(`SELECT titulo_aba, conteudo_html, 1 - (embedding <=> CAST(:embedding AS vector)) AS score FROM conteudos_trilha WHERE id_trilha = :idTrilha AND embedding IS NOT NULL ORDER BY embedding <=> CAST(:embedding AS vector) LIMIT 3`, { replacements: { embedding: vectorToString(embeddingConsulta), idTrilha: trilha.id } });
          contextoRecuperado = resultados;
        } catch (error) {
          console.warn('[CHAT] RAG indisponivel; usando contexto direto:', error.message);
        }
      }
    }

    const historico = await InteracaoChat.findAll({
      where: { id_aluno },
      order: [['createdAt', 'ASC']],
      limit: 6,
    });

    const contextoHistorico = (historico || [])
      .map((item) => `Pergunta: ${item.pergunta}\nResposta: ${item.resposta}`)
      .join('\n\n');

    const contextoLigado = contextoRecuperado.length > 0
      ? `Contexto recuperado por similaridade semantica (pgvector):\n${contextoRecuperado.map((item) => `- ${item.titulo_aba}: ${item.conteudo_html}`).join('\n')}`
      : 'Contexto recuperado: nenhum trecho relevante encontrado.';

    const progresso = await Progresso.findOne({ where: { id_aluno } });
    const nivel = progresso?.nivel || 'iniciante';
    const contextoProgresso = progresso
      ? `XP total: ${progresso.xp_total || 0}; badges: ${(progresso.badges || []).join(', ') || 'nenhuma'}; dados de evolução: ${JSON.stringify(progresso.dados_evolucao || {})}.`
      : 'Nenhum progresso agregado registrado ainda.';

    const prompt = `${contextoTrilha}${contextoLigado}
Historico recente do aluno:
${contextoHistorico || 'Sem historico anterior.'}
Progresso registrado do aluno:
${contextoProgresso}

Voce e um mentor virtual de programacao e tecnologia. O aluno esta no nivel "${nivel}".
Baseie sua resposta no contexto da trilha e no historico recente fornecidos acima. Se nao houver contexto, responda de forma geral sobre programacao/tecnologia.
Responda de forma didatica e simples, adaptando a linguagem ao nivel do aluno. Nunca responda com conselhos vagos: use os nomes das atividades e duracoes presentes no plano quando existirem. Para "estudo de hoje", monte um roteiro de 2 ou 3 etapas, com duracao e resultado esperado. Para "progresso", cite nota, nivel, pontos a revisar e proximo passo. Para uma explicacao, inclua conceito, exemplo prático e exercício curto.
Voce SOBEM responder sobre programacao, desenvolvimento de software, e areas tech.

Pergunta: ${pergunta}`;

    let resposta;
    try {
      resposta = await completar({ ...aiConfig, prompt, temperature: 0.7 });
    } catch (error) {
      console.warn('[CHAT] IA indisponivel; usando resposta local:', error.message);
      resposta = respostaLocal(pergunta, nivel, trilhaAtual, trilhaAtual?.ConteudoTrilhas || []);
    }

    await InteracaoChat.create({
      id_aluno,
      id_trilha: id_trilha || null,
      pergunta,
      resposta,
    });

    return res.json({ status: 'SUCESSO', resposta });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO', mensagem: 'Erro ao responder' });
  }
}

export async function historico(req, res) {
  try {
    const { id_trilha } = req.query;
    const where = { id_aluno: req.usuario.id };

    if (id_trilha) where.id_trilha = id_trilha;

    const interacoes = await InteracaoChat.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    return res.json({ status: 'SUCESSO', interacoes });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}

export async function limparHistorico(req, res) {
  try {
    const id_aluno = req.usuario.id;

    await InteracaoChat.destroy({ where: { id_aluno } });

    return res.json({ status: 'SUCESSO', mensagem: 'Historico limpo' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: 'ERRO' });
  }
}
