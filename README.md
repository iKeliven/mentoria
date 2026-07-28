# MentorIA

Plataforma educacional de programacao com Inteligencia Artificial. O usuario cria trilhas de estudo personalizadas, gera aulas, questionarios e conversa com um mentor virtual — tudo impulsionado por IA ( Google Gemini).

---

## Stack Tecnologica

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, React Router v7 |
| Backend | Express.js, Sequelize ORM, Node.js |
| Banco | PostgreSQL |
| IA | Google Generative AI (Gemini) |

---

## Funcionalidades

### 1. Autenticacao
- Cadastro e login com JWT
- Perfil do usuario com opcao de alterar senha
- Gerenciamento completo de dados (apagar historico de chat e todos os dados da conta)

### 2. Trilhas de Estudo
- Criar trilhas com nome, area, nivel (iniciante/intermediario/avançado) e descricao
- A IA valida se o conteudo e realmente sobre programacao/tecnologia antes de criar
- Selecionar trilha ativa para estudar
- Editar e excluir trilhas (com exclusao em cascata de conteudo e aulas)

### 3. Conteudo e Aulas
- A IA gera automaticamente o conteudo da trilha (topicos, conceitos, exemplos de codigo)
- Cada conteudo da trilha gera uma aula acessivel pela pagina Inicio
- Criar aulas manualmente a partir do conteudo de qualquer trilha
- Listar e excluir aulas

### 4. Questionarios
- Gerar questionarios automaticos com 20 questoes de multipla escolha
- Responder questionarios com feedback imediato
- A IA valida se a area da trilha e sobre programacao antes de gerar
- Registro de respostas e nivel de dificuldade

### 5. Avaliacao de Nivel
- Gerar avaliacao adaptativa para descobrir o nivel do aluno
- Questoes com dificuldade progressiva
- Calculo automatico do nivel com base no desempenho
- Historico de avaliacoes

### 6. Mentor IA (Chat)
- Conversa com IA sobre programacao e tecnologia
- Contexto da trilha ativa e utilizado para respostas personalizadas
- Adaptacao ao nivel do aluno
- Historico de conversas com opcao de limpar
- Validacao de contexto: a IA so responde sobre programacao/tech

### 7. Progresso
- Acompanhamento de progresso geral
- Graficos de desempenho

### 8. Configuracao da IA
- Utilize Google Gemini como provedor
- Inserir propria API key (gratuita)
- Testar conexao antes de salvar
- Configuracao salva no navegador e enviada em cada requisicao

---

## Como Rodar

### Pre-requisitos
- Node.js 18+
- PostgreSQL rodando
- npm ou yarn

### 1. Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE mentoria;
```

### 2. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentoria
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta

# API Key padrao (fallback caso o usuario nao configure a propria)
API_KEY=sua_chave_gemini_aqui
```

Inicie o servidor:

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Producao
npm start
```

O backend roda em `http://localhost:3000`. Para o RAG, o PostgreSQL precisa ter a extensao **pgvector** instalada; na inicializacao o sistema cria a extensao, a coluna `embedding vector(768)` e o indice vetorial automaticamente.

### 3. Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=/api/
VITE_BACKEND_URL=http://localhost:3000
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend roda em `http://localhost:5173`.

---

## Fluxo Completo do Usuario

```
Cadastro/Login
      |
      v
  Inicio (Aulas)
      |
      +----> Criar Trilha ----> IA gera conteudo ----> Aulas criadas automaticamente
      |                                                      |
      |                                                      v
      |                                            Questionario sobre a trilha
      |                                                      |
      |                                                      v
      |                                            Avaliacao de nivel
      |
      +----> Mentor IA (Chat) <---- contexto da trilha ativa
      |
      +----> Minhas Trilhas (gerenciar)
      |
      +----> Config. IA (definir provedor e chave)
      |
      v
    Perfil (alterar senha, apagar dados)
```

### Passo a passo:

1. **Cadastrar** uma conta no sistema
2. **Configurar a IA** em Config. IA — escolher  ou Gemini, colar sua API key (gratuita) e selecionar um modelo
3. **Criar uma trilha** em Minhas Trilhas — informar nome, area, nivel e descricao (deve ser sobre programacao/tech)
4. A IA **gera o conteudo** automaticamente e aulas sao criadas na pagina Inicio
5. **Estudar** as aulas, responder questionarios gerados pela IA
6. **Conversar com o Mentor IA** para tirar duvidas sobre o conteudo da trilha
7. **Acompanhar o progresso** e gerar avaliacoes de nivel

---

## Modelos de IA Disponiveis (Gratuitos)

### Google Gemini
| Modelo | Descricao |
|--------|-----------|
| `gemini-2.0-flash` | Mais recente e rapido |
| `gemini-2.5-flash` | Versao avancada |
| `gemini-1.5-flash` | Balanceado |
| `gemini-1.5-pro` | Mais potente |

> Para obter chaves gratuitas:
> - **Gemini**: https://aistudio.google.com/apikey

---

## API (Endpoints)

Todas as rotas exceto cadastro e login requerem header `Authorization: Bearer <token>`.

### Autenticacao
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/usuario/cadastrar` | Criar conta |
| POST | `/usuario/login` | Login |
| GET | `/usuario/auth/perfil` | Ver perfil |
| PUT | `/usuario/alterar-senha` | Alterar senha |
| DELETE | `/usuario/dados` | Apagar todos os dados |

### Trilhas
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/trilhas` | Listar trilhas do usuario |
| POST | `/trilhas` | Criar trilha (validacao IA) |
| PUT | `/trilhas/:id` | Atualizar trilha (admin) |
| DELETE | `/trilhas/:id` | Excluir trilha + conteudo + aulas |
| POST | `/trilhas/selecionar` | Selecionar trilha ativa |
| POST | `/trilhas/:id/gerar-questionario` | Gerar questionario via IA |
| POST | `/trilhas/:id/responder-questionario` | Responder questionario |

### Aulas
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/aulas` | Listar aulas do usuario |
| POST | `/aulas` | Criar aula |
| DELETE | `/aulas/:id` | Excluir aula |

### Chat
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/chat/perguntar` | Perguntar ao mentor IA |
| GET | `/chat/historico` | Historico de conversas |
| DELETE | `/chat/historico` | Limpar historico |

### Avaliacao
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/avaliacao/gerar` | Gerar avaliacao de nivel |
| POST | `/avaliacao/responder` | Responder avaliacao |
| GET | `/avaliacao/historico` | Historico de avaliacoes |

### Progresso
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/progresso` | Obter progresso |
| GET | `/progresso/graficos` | Dados para graficos |

### IA
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/ia/modelos` | Listar modelos disponiveis |
| GET | `/ia/rag-status` | Verificar configuracao do RAG com pgvector |

### Headers de IA ( opcionais )

Todos os endpoints que utilizam IA aceitam headers para configurar o provedor:

```
x-ai-provider: gemini
x-ai-api-key: sua_chave
x-ai-model: id_do_modelo
```

Se nao enviados, usa o fallback do `.env`.

---

## Seguranca

- **Validacao de contexto**: toda interacao com IA e validada por um modelo de IA que verifica se o conteudo e sobre programacao/tecnologia. Conteudo nao relacionado e rejeitado com erro 400.
- **JWT**: autenticacao via token JWT no header Authorization.
- **Propriedade**: cada usuario so ve e gerencia suas proprias trilhas, aulas e historico.
- **API keys do usuario**: enviadas via headers HTTP, nunca armazenadas no banco. Ficam salvas apenas no localStorage do navegador.

---

## Estrutura do Projeto

```
MentorIA/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── aiService.js        # Servico de IA (Gemini)
│   │   ├── controllers/
│   │   │   ├── authController.js    # Cadastro, login, perfil
│   │   │   ├── trilhaController.js  # CRUD trilhas + questionario
│   │   │   ├── chatController.js    # Chat com mentor IA
│   │   │   ├── aulaController.js    # CRUD aulas
│   │   │   ├── avaliacaoController.js # Avaliacoes de nivel
│   │   │   ├── planoController.js   # Plano de ensino
│   │   │   └── progressoController.js # Progresso do aluno
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT + autorizacao
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Trilha.js
│   │   │   ├── Competencia.js
│   │   │   ├── Topico.js
│   │   │   ├── ConteudoTrilha.js
│   │   │   ├── Aula.js
│   │   │   ├── Avaliacao.js
│   │   │   ├── Questao.js
│   │   │   ├── Resposta.js
│   │   │   ├── InteracaoChat.js
│   │   │   ├── PlanoEnsino.js
│   │   │   ├── Progresso.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── server.js
│   │   └── database.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── SideBar.jsx
│   │   ├── constants/
│   │   │   └── colors.js
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Cadastro.jsx
│   │   │   ├── Inicio.jsx
│   │   │   ├── MinhasTrilhas.jsx
│   │   │   ├── AdicionarTrilha.jsx
│   │   │   ├── ResponderQuestionario.jsx
│   │   │   ├── ChatMentor.jsx
│   │   │   ├── ConfiguracoesIA.jsx
│   │   │   ├── Perfil.jsx
│   │   │   ├── AvaliacaoNivel.jsx
│   │   │   └── LoadingScreen.jsx
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── authService.js
│   │   │   ├── trilhaService.js
│   │   │   ├── chatService.js
│   │   │   ├── aulaService.js
│   │   │   └── avaliacaoService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Licenca

Projeto academico desenvolvido como situação de aprendizagem para exemplo dos alunos.
# mentoria
# mentoria
# mentoria
