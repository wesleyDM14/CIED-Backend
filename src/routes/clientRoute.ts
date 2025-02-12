import { Router } from "express";
import ClientController from "../controllers/clientController";
import { authMiddleware } from "../middlewares/authMiddleware";

const clientController = new ClientController();
const router = Router();

export default router;