import prisma from "../database";
import bcrypt from 'bcryptjs';
import { generateAccessToken } from "../functions/generateAccessToken";

class UserService {

    async authenticateUser(email: string, password: string) {
        const userAuthenticate = await prisma.user.findUnique({ where: { email } });

        if (!userAuthenticate) {
            throw new Error('Email não encontrado no banco de dados.');
        }

        const passwordMatch = await bcrypt.compare(password, userAuthenticate.password);

        if (!passwordMatch) {
            throw new Error('Senha incorreta.');
        }

        const accessToken = generateAccessToken(userAuthenticate.id);
        return { accessToken, userRole: userAuthenticate.role };
    }

    async createUser(email: string, password: string) {
        const existingUser = await prisma.user.findUnique({ where: { email: email } });

        if (existingUser) {
            throw new Error('Email já cadastrado no Banco de Dados.');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashPassword,
                role: "OPERATOR"
            }
        });

        return newUser;
    }

    async getUsers() {
        const users = await prisma.user.findMany();
        return users;
    }

    async getUserByEmail(email: string) {
        return await prisma.user.findUnique({ where: { email } });
    }

    async updateUserPassword(userId: string, email: string, newPassword: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            throw new Error('Usuário não encontrado no banco de dados.');
        }

        if (existingUser.id !== userId && existingUser.role !== 'ADMIN') {
            throw new Error('Você não tem permissão para modificar esse usuário.');
        }

        const hashNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashNewPassword
            }
        });

        return;
    }

    async deleteUser(email: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            throw new Error('Usuário não encontrado no Banco de Dados.');
        }

        await prisma.user.delete({ where: { email } });

        return;
    }
}

export default UserService;