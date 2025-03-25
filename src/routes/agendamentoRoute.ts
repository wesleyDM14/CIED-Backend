import { Router } from "express";
import AgendaController from "../controllers/agendaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const agendaController = new AgendaController();
const router = Router();

router.post('/mensal', authMiddleware, agendaController.registrarAgendaMensal.bind(agendaController));
router.post("/semanal", authMiddleware, agendaController.registrarAgendaSemanal.bind(agendaController));
router.post("/diaria", authMiddleware, agendaController.registrarAgendaDiaria.bind(agendaController));

router.get("/mensal", authMiddleware, agendaController.getAgendaMensal.bind(agendaController));
router.get("/semanal", authMiddleware, agendaController.getAgendaSemanal.bind(agendaController));
router.get("/diaria", authMiddleware, agendaController.getAgendaDiaria.bind(agendaController));

router.put("/diaria/:scheduleId", authMiddleware, agendaController.editarAgendaMensal.bind(agendaController));
router.post("/procedimento", authMiddleware, agendaController.acrescentarProcedimento.bind(agendaController));
router.delete("/procedimento/:scheduleId/:procedimentoId", authMiddleware, agendaController.removerProcedimento.bind(agendaController));

export default router;
