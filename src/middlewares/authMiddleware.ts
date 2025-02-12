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
        res.status(401).json({ error: 'Authorization header missing.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token is missing' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Payload;

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        req.user = { id: user.id, userRole: user.role };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
        return;
    }
}

export const IsAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.userRole !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Acesso negado. Esta rota é restrita apenas para administradores.' });
        return;
    }
    next();
}