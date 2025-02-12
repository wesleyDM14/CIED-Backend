import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database";
import { UserRole } from "@prisma/client";

interface Payload {
    id: string
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Payload;

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        req.user = { id: user.id, userRole: user.role };
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}

export const IsAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Acesso negado. Esta rota é restrita apenas para administradores.' });
    }
    return next();
}