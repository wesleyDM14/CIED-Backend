import { Router } from "express";
import TicketController from "../controllers/ticketController";
import { authMiddleware } from "../middlewares/authMiddleware";

const ticketController = new TicketController();
const router = Router();

router.post('/create', ticketController.createTicket.bind(ticketController));
router.post('/loggedCreate', authMiddleware, ticketController.createTicketFromWebApp.bind(ticketController));
router.post('/call', authMiddleware, ticketController.callNextTicket.bind(ticketController));
router.post('/call-specific', authMiddleware, ticketController.callSpecificTicket.bind(ticketController));
router.post('/reemit', authMiddleware);
router.get('/display-data', authMiddleware, ticketController.getDisplayData.bind(ticketController));
router.get('/queue', authMiddleware, ticketController.getQueue.bind(ticketController));
router.get('/dashboard-summary', authMiddleware, ticketController.getDashboardSummary.bind(ticketController));
router.put('/finalize/:ticketId', authMiddleware, ticketController.finalizeTicket.bind(ticketController));
router.delete('/ticket/:ticketId', authMiddleware, ticketController.deleteTicket.bind(ticketController));

export default router;