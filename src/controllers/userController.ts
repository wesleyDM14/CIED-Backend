import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";

const userService = new UserService();

class UserController {

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e Senha são obrigatórios.' });
            }

            const newUser = await userService.createUser(email, password);
            return res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;