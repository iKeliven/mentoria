import { Router } from 'express';
import { cadastrar, login, perfil, alterarSenha, apagarDados } from '../controllers/authController.js';
import { listar, criar, atualizar, excluir, selecionar, gerarQuestionario, responderQuestionario } from '../controllers/trilhaController.js';
import { gerar, responder, historico as historicoAvaliacao } from '../controllers/avaliacaoController.js';
import { visualizar, gerar as gerarPlano } from '../controllers/planoController.js';
import { perguntar, historico as historicoChat, limparHistorico } from '../controllers/chatController.js';
import { obter, graficos } from '../controllers/progressoController.js';
import { criar as criarAula, listar as listarAulas, excluir as excluirAula } from '../controllers/aulaController.js';
import { MODELOS_GEMINI } from '../config/aiService.js';
import { autenticar, autorizar } from '../middleware/auth.js';

const router = Router();

router.post('/usuario/cadastrar', cadastrar);
router.post('/usuario/login', login);
router.get('/usuario/auth/perfil', autenticar, perfil);
router.put('/usuario/alterar-senha', autenticar, alterarSenha);
router.delete('/usuario/dados', autenticar, apagarDados);

router.get('/trilhas', autenticar, listar);
router.post('/trilhas', autenticar, criar);
router.put('/trilhas/:id', autenticar, autorizar('admin'), atualizar);
router.delete('/trilhas/:id', autenticar, excluir);
router.post('/trilhas/selecionar', autenticar, selecionar);
router.post('/trilhas/:id/gerar-questionario', autenticar, gerarQuestionario);
router.post('/trilhas/:id/responder-questionario', autenticar, responderQuestionario);

router.post('/avaliacao/gerar', autenticar, gerar);
router.post('/avaliacao/responder', autenticar, responder);
router.get('/avaliacao/historico', autenticar, historicoAvaliacao);

router.get('/plano', autenticar, visualizar);
router.post('/plano/gerar', autenticar, gerarPlano);

router.post('/chat/perguntar', autenticar, perguntar);
router.get('/chat/historico', autenticar, historicoChat);
router.delete('/chat/historico', autenticar, limparHistorico);

router.post('/aulas', autenticar, criarAula);
router.get('/aulas', autenticar, listarAulas);
router.delete('/aulas/:id', autenticar, excluirAula);

router.get('/progresso', autenticar, obter);
router.get('/progresso/graficos', autenticar, graficos);

router.get('/ia/modelos', autenticar, (req, res) => {
  return res.json({
    status: 'SUCESSO',
    gemini: MODELOS_GEMINI,
  });
});

router.get('/ia/rag-status', autenticar, (req, res) => {
  return res.json({
    status: 'SUCESSO',
    enabled: true,
    strategy: 'gemini-text-embedding-004-com-pgvector',
    dimensions: 768,
  });
});

export default router;
