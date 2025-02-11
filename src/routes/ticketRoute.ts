import { Router } from "express";
import TicketController from "../controllers/ticketController";

const ticketController = new TicketController();
const router = Router();

export default router;