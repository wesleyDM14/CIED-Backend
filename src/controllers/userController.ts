import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";
import { UserRole } from "@prisma/client";

const userService = new UserService();

class UserController {

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {

            if (req.user.userRole !== UserRole.ADMIN) {
                res.status(403).json({ error: 'Usuário sem permissão para criar novos usuários' });
                return;
            }

            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email e Senha são obrigatórios.' });
                return;
            }

            const newUser = await userService.createUser(email, password);
            res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.user.userRole !== UserRole.ADMIN) {
                res.status(403).json({ error: 'Usuário sem permissão para acessar os usuários' });
                return;
            }

            const users = userService.getUsers();

            res.status(200).json(users);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;

            if (!email) {
                res.status(400).json({ error: 'Email é obrigatório.' });
                return;
            }

            const user = await userService.getUserByEmail(email);
            res.status(200).json(user);
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { newPassword } = req.body;
            const email = req.params.email;

            if (!newPassword || !email) {
                res.status(400).json({ error: 'Parâmetros faltando' });
                return;
            }

            await userService.updateUserPassword(req.user.id, email, newPassword);

            res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.user.userRole !== UserRole.ADMIN) {
                res.status(403).json({ error: 'Você não tem permissão para deletar usuários' });
                return;
            }

            const email = req.params.email;

            if (!email) {
                res.status(400).json({ error: 'Email é obrigatório' });
                return;
            }

            await userService.deleteUser(email);

            res.status(200).json({ message: 'Usuário deletado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;