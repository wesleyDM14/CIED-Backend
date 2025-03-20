import { Router } from "express";
import AtendimentoController from "../controllers/atendimentoController";
import { authMiddleware } from "../middlewares/authMiddleware";

const atendimentoController = new AtendimentoController();
const router = Router();

router.post('/create', authMiddleware, atendimentoController.createAtendimento.bind(atendimentoController));
router.post('/atendimento/agendamentos', authMiddleware, atendimentoController.getAtendimentosByDate.bind(atendimentoController));
router.get('/atendimentos', authMiddleware, atendimentoController.getAtendimentos.bind(atendimentoController));
router.get('/cliente/:clientId', authMiddleware, atendimentoController.getAtendimentosByClientId.bind(atendimentoController));
router.get('/procedimento/:procedimentoId', authMiddleware, atendimentoController.getAtendimentosByProcedimentoId.bind(atendimentoController));
router.get('/atendimento/:atendimentoId', authMiddleware, atendimentoController.getAtendimentoById.bind(atendimentoController));
router.put('/atendimento/:atentimentoId', authMiddleware, atendimentoController.updateAtendimento.bind(atendimentoController));
router.delete('/atendimento/:atendimentoId', authMiddleware, atendimentoController.deleteAtendimento.bind(atendimentoController));

export default router;