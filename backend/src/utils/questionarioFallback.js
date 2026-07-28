const BASE_QUESTIONS = [
  ['O que é uma variável em programação?', ['Um espaço para guardar um valor', 'Um tipo de navegador', 'Um banco de dados', 'Um sistema operacional'], 0],
  ['Qual estrutura é usada para tomar decisões no código?', ['if / else', 'import', 'console.log', 'return'], 0],
  ['Para que serve uma função?', ['Reutilizar uma tarefa ou lógica', 'Apagar arquivos', 'Criar uma senha', 'Instalar um navegador'], 0],
  ['O que é HTML?', ['Uma linguagem de marcação', 'Um banco de dados', 'Um servidor', 'Uma planilha'], 0],
  ['Qual é a finalidade de uma API?', ['Permitir comunicação entre sistemas', 'Desenhar interfaces', 'Criar senhas', 'Substituir o banco de dados'], 0],
  ['O que é um array?', ['Uma lista ordenada de valores', 'Um tipo de servidor', 'Uma tela do sistema', 'Uma senha temporária'], 0],
  ['Qual tecnologia é usada para estilizar páginas web?', ['CSS', 'SQL', 'JWT', 'Node'], 0],
  ['O que significa depurar um programa?', ['Encontrar e corrigir erros', 'Publicar o código', 'Apagar o banco', 'Criar uma trilha'], 0],
  ['Qual operador compara dois valores em JavaScript?', ['=', '==', '===', '=>'], 2],
  ['O que um loop permite fazer?', ['Repetir uma instrução', 'Criar uma imagem', 'Apagar variáveis', 'Alterar o navegador'], 0],
  ['Qual estrutura guarda pares de chave e valor?', ['Objeto', 'String', 'Booleano', 'Função'], 0],
  ['O que retorna uma função quando usa return?', ['Um resultado para quem a chamou', 'Uma nova página', 'Um banco de dados', 'Uma senha'], 0],
  ['Para que serve o Git?', ['Controlar versões do código', 'Estilizar páginas', 'Criar tabelas HTML', 'Executar SQL'], 0],
  ['O que é uma requisição HTTP GET?', ['Uma solicitação para obter dados', 'Uma exclusão de dados', 'Uma senha de acesso', 'Um tipo de banco'], 0],
  ['Qual status HTTP indica sucesso?', ['200', '404', '500', '401'], 0],
  ['O que é uma chave primária em um banco?', ['Identificador único de um registro', 'Uma senha do banco', 'Uma tabela temporária', 'Uma consulta SQL'], 0],
  ['O que um componente React normalmente retorna?', ['Interface em JSX', 'Uma tabela SQL', 'Um arquivo de imagem', 'Uma chave de API'], 0],
  ['Qual hook React armazena um valor que muda na tela?', ['useState', 'useRoute', 'useHtml', 'useDatabase'], 0],
  ['O que é responsividade?', ['Adaptar a interface a diferentes telas', 'Aumentar o banco de dados', 'Criar uma API', 'Criptografar senhas'], 0],
];

const BANCO_DE_DADOS_QUESTIONS = [
  ['O que é uma tabela em um banco relacional?', ['Uma coleção de registros organizados em colunas', 'Um arquivo de imagem', 'Uma linguagem de estilo', 'Um servidor web'], 0],
  ['Qual comando SQL consulta dados?', ['SELECT', 'UPDATE', 'DELETE', 'DROP'], 0],
  ['Qual comando adiciona um novo registro?', ['INSERT', 'SELECT', 'ALTER', 'GRANT'], 0],
  ['O que identifica unicamente cada linha de uma tabela?', ['Chave primária', 'Chave estrangeira', 'Índice visual', 'Coluna opcional'], 0],
  ['Para que serve uma chave estrangeira?', ['Relacionar tabelas', 'Apagar registros', 'Criptografar dados', 'Criar uma view'], 0],
  ['Qual cláusula filtra resultados de uma consulta?', ['WHERE', 'ORDER BY', 'GROUP BY', 'JOIN'], 0],
  ['Qual comando altera dados existentes?', ['UPDATE', 'INSERT', 'SELECT', 'CREATE'], 0],
  ['O que faz o comando DELETE?', ['Remove registros', 'Cria uma tabela', 'Consulta colunas', 'Renomeia o banco'], 0],
  ['Qual cláusula ordena o resultado?', ['ORDER BY', 'WHERE', 'VALUES', 'SET'], 0],
  ['O que é normalização?', ['Organizar dados para reduzir redundância', 'Copiar tabelas', 'Apagar índices', 'Criar senhas'], 0],
  ['Qual JOIN retorna linhas relacionadas das duas tabelas?', ['INNER JOIN', 'DROP JOIN', 'VALUE JOIN', 'INDEX JOIN'], 0],
  ['Qual função conta registros?', ['COUNT', 'SUM', 'ORDER', 'LIMIT'], 0],
  ['Para que serve um índice?', ['Acelerar consultas', 'Duplicar dados', 'Apagar chaves', 'Criar usuários'], 0],
  ['O que significa NULL?', ['Valor ausente ou desconhecido', 'Número zero', 'Texto vazio sempre', 'Chave primária'], 0],
  ['Qual restrição impede valores repetidos?', ['UNIQUE', 'DEFAULT', 'CHECK', 'NOT NULL'], 0],
  ['O que uma transação garante?', ['Execução consistente de operações', 'Uma cópia da tabela', 'Um tipo de coluna', 'Uma senha segura'], 0],
  ['Qual isolamento evita leitura de dados não confirmados?', ['READ COMMITTED', 'READ EMPTY', 'PUBLIC', 'OPEN'], 0],
  ['O que é uma view?', ['Consulta armazenada como tabela virtual', 'Backup completo', 'Chave estrangeira', 'Arquivo de configuração'], 0],
  ['Qual comando cria uma tabela?', ['CREATE TABLE', 'INSERT TABLE', 'SELECT TABLE', 'UPDATE TABLE'], 0],
  ['O que faz a cláusula LIMIT?', ['Restringe a quantidade de linhas', 'Remove colunas', 'Cria índices', 'Relaciona tabelas'], 0],
];

export function criarQuestoesFallback(total = 20, tema = '') {
  const perguntas = String(tema).toLowerCase().includes('banco') || String(tema).toLowerCase().includes('dados')
    ? BANCO_DE_DADOS_QUESTIONS
    : BASE_QUESTIONS;
  return Array.from({ length: total }, (_, index) => {
    const [enunciado, opcoes, resposta_correta] = perguntas[index % perguntas.length];
    const deslocamento = index % opcoes.length;
    const opcoesEmbaralhadas = [...opcoes.slice(deslocamento), ...opcoes.slice(0, deslocamento)];
    return {
    enunciado,
    opcoes: opcoesEmbaralhadas,
    resposta_correta: (resposta_correta - deslocamento + opcoes.length) % opcoes.length,
    nivel_dificuldade: index < 7 ? 'iniciante' : index < 14 ? 'intermediario' : 'avancado',
    };
  });
}

export function criarPlanoFallback(trilha) {
  const tema = `${trilha.nome} ${trilha.area}`.toLowerCase();
  const bancoDeDados = tema.includes('banco') || tema.includes('dados');
  const frontend = tema.includes('front') || tema.includes('web') || tema.includes('react');
  const fundamentos = bancoDeDados
    ? '<h3>Fundamentos de Banco de Dados</h3><p>Entenda como dados são organizados e relacionados em um banco relacional.</p><ul><li>Modelagem de entidades e relacionamentos — 45 min</li><li>Tabelas, colunas e tipos de dados — 35 min</li><li>Chaves primárias e estrangeiras — 40 min</li></ul>'
    : frontend
      ? '<h3>Fundamentos de Desenvolvimento Front-end</h3><p>Construa uma base sólida para criar interfaces web.</p><ul><li>Estrutura com HTML — 30 min</li><li>Semântica e acessibilidade — 45 min</li><li>Estilos com CSS — 60 min</li></ul>'
      : `<h3>Fundamentos de ${trilha.nome}</h3><p>Revise os conceitos essenciais e pratique exemplos curtos todos os dias.</p><ul><li>Conceitos básicos — 30 min</li><li>Exercícios guiados — 45 min</li><li>Revisão de pontos-chave — 25 min</li></ul>`;
  const pratica = bancoDeDados
    ? '<h3>Prática aplicada</h3><p>Use SQL para consultar e manipular informações em tabelas.</p><ul><li>Consultas SELECT com filtros — 45 min</li><li>JOIN entre tabelas relacionadas — 60 min</li><li>INSERT, UPDATE e DELETE com segurança — 50 min</li></ul>'
    : frontend
      ? '<h3>Prática aplicada</h3><p>Transforme os conceitos em páginas funcionais e responsivas.</p><ul><li>Construir uma página de apresentação — 60 min</li><li>Aplicar layout com Flexbox — 50 min</li><li>Revisar responsividade e acessibilidade — 40 min</li></ul>'
      : '<h3>Prática aplicada</h3><p>Resolva desafios progressivos e registre as dúvidas para discutir com o MentorIA.</p><ul><li>Projetos pequenos — 60 min</li><li>Revisão dos erros — 35 min</li><li>Desafio progressivo — 50 min</li></ul>';
  const projeto = bancoDeDados
    ? '<h3>Projeto de consolidação</h3><p>Modele e implemente um banco para uma aplicação simples.</p><ul><li>Desenhar o modelo entidade-relacionamento — 60 min</li><li>Criar tabelas e restrições — 75 min</li><li>Escrever consultas de relatório — 60 min</li></ul>'
    : frontend
      ? '<h3>Projeto de consolidação</h3><p>Crie uma interface completa para reunir os conhecimentos da trilha.</p><ul><li>Planejar as seções da página — 45 min</li><li>Implementar HTML e CSS — 90 min</li><li>Revisar em diferentes tamanhos de tela — 45 min</li></ul>'
      : `<h3>Projeto de consolidação</h3><p>Crie um projeto simples para reunir o que você aprendeu em ${trilha.nome}.</p><ul><li>Planejamento do projeto — 45 min</li><li>Implementação da primeira versão — 75 min</li><li>Revisão e melhoria — 45 min</li></ul>`;
  return {
    resumo: `Plano introdutório de ${trilha.nome}, organizado a partir da avaliação de nivelamento.`,
    abas: [
      { titulo: 'Fundamentos', conteudo: fundamentos },
      { titulo: 'Prática aplicada', conteudo: pratica },
      { titulo: 'Projeto', conteudo: projeto },
    ],
  };
}
