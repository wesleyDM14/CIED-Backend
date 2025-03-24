import { Router } from "express";
import AgendaController from "../controllers/agendaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const agendaController = new AgendaController();
const router = Router();

router.post('/agenda/mensal', authMiddleware, agendaController.registrarAgendaMensal.bind(agendaController));
router.post("/agenda/semanal", authMiddleware, agendaController.registrarAgendaSemanal.bind(agendaController));
router.post("/agenda/diaria", authMiddleware, agendaController.registrarAgendaDiaria.bind(agendaController));

router.get("/agenda/mensal", authMiddleware, agendaController.getAgendaMensal.bind(agendaController));
router.get("/agenda/semanal", authMiddleware, agendaController.getAgendaSemanal.bind(agendaController));
router.get("/agenda/diaria", authMiddleware, agendaController.getAgendaDiaria.bind(agendaController));

router.put("/agenda/diaria/:scheduleId", authMiddleware, agendaController.editarAgendaMensal.bind(agendaController));
router.post("/agenda/procedimento", authMiddleware, agendaController.acrescentarProcedimento.bind(agendaController));
router.delete("/agenda/procedimento/:scheduleId/:procedimentoId", authMiddleware, agendaController.removerProcedimento.bind(agendaController));

export default router;
