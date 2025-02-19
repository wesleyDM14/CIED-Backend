import { Router } from "express";
import UserController from "../controllers/userController";
import { authMiddleware, IsAdminUser } from "../middlewares/authMiddleware";

const userController = new UserController();
const router = Router();

router.post('/login', userController.authenticateUser.bind(userController));
router.post('/create', authMiddleware, IsAdminUser, userController.createUser.bind(userController));
router.get('/users', authMiddleware, IsAdminUser, userController.getUsers.bind(userController));
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));
router.get('/user/:email', authMiddleware, userController.getUserByEmail.bind(userController));
router.put('/user/:email', authMiddleware, userController.updateUser.bind(userController));
router.delete('/user/:email', authMiddleware, IsAdminUser, userController.deleteUser.bind(userController));

export default router;