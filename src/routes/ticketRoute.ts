import { Router } from "express";
import TicketController from "../controllers/ticketController";
import { authMiddleware } from "../middlewares/authMiddleware";

const ticketController = new TicketController();
const router = Router();

// --- Rotas de Criação ---
router.post('/create', ticketController.createTicket.bind(ticketController));
router.post('/loggedCreate', authMiddleware, ticketController.createTicketFromWebApp.bind(ticketController));
router.post('/schedule', authMiddleware, ticketController.createScheduledTicket.bind(ticketController)); // <-- ROTA ADICIONADA

// --- Rotas de Chamada e Ações ---
router.post('/call', authMiddleware, ticketController.callNextTicket.bind(ticketController));
router.post('/call-specific', authMiddleware, ticketController.callSpecificTicket.bind(ticketController));
router.put('/finalize/:ticketId', authMiddleware, ticketController.finalizeTicket.bind(ticketController));
router.delete('/ticket/:ticketId', authMiddleware, ticketController.deleteTicket.bind(ticketController));

// TODO: Implementar a função 'reemitTicket' no controller e descomentar a linha abaixo
// router.post('/reemit', authMiddleware, ticketController.reemitTicket.bind(ticketController));

// --- Rotas de Consulta ---
router.get('/display-data', authMiddleware, ticketController.getDisplayData.bind(ticketController));
router.get('/queue', authMiddleware, ticketController.getQueue.bind(ticketController));
router.get('/dashboard-summary', authMiddleware, ticketController.getDashboardSummary.bind(ticketController));


export default router;