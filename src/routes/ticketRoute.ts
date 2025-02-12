import { Router } from "express";
import TicketController from "../controllers/ticketController";
import { authMiddleware } from "../middlewares/authMiddleware";

const ticketController = new TicketController();
const router = Router();

router.post('/call', authMiddleware, ticketController.callNextTicket.bind(ticketController));
router.post('/second-call', authMiddleware, ticketController.secondCall.bind(ticketController));
router.get('/display-data', authMiddleware, ticketController.getDisplayData.bind(ticketController));
router.get('/queue', authMiddleware, ticketController.getTicketQueue.bind(ticketController));
router.delete('/ticket/:ticketId', authMiddleware, ticketController.deleteTicket.bind(ticketController));

export default router;