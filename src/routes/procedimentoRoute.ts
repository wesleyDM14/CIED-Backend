import { Router } from "express";
import ProcedimentoController from "../controllers/procedimentoController";
import { authMiddleware } from "../middlewares/authMiddleware";

const procedimentoController = new ProcedimentoController();
const router = Router();

router.post('/create', authMiddleware, procedimentoController.createProcedimento.bind(procedimentoController));
router.get('/procedimentos', authMiddleware, procedimentoController.getProcedimentos.bind(procedimentoController));
router.get('/procedimento/:procedimentoId', authMiddleware, procedimentoController.getProcedimentoById.bind(procedimentoController));
router.put('/procedimento/:procedimentoId', authMiddleware, procedimentoController.updateProcedimento.bind(procedimentoController));
router.delete('/procedimento/:procedimentoId', authMiddleware, procedimentoController.deleteProcedimento.bind(procedimentoController));

export default router;