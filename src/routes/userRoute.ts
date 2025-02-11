import { Router } from "express";
import UserController from "../controllers/userController";

const userController = new UserController();
const router = Router();

export default router;