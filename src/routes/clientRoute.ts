import { Router } from "express";
import ClientController from "../controllers/clientController";
import { authMiddleware } from "../middlewares/authMiddleware";

const clientController = new ClientController();
const router = Router();

router.post('/create', authMiddleware, clientController.createClient.bind(clientController));
router.get('/clientes', authMiddleware, clientController.getClients.bind(clientController));
router.get('/cliente/:clientId', authMiddleware, clientController.getClientById.bind(clientController));
router.get('/email/:email', authMiddleware, clientController.getClientByEmail.bind(clientController));
router.put('/cliente/:clientId', authMiddleware, clientController.updatedClient.bind(clientController));
router.delete('/cliente/:clientId', authMiddleware, clientController.deleteClient.bind(clientController));

export default router;