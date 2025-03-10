import { NextFunction, Request, Response } from "express";

import TicketService from "../services/ticketService";
import { TicketType } from "@prisma/client";

const ticketService = new TicketService();

class TicketController {

    async createTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { type } = req.body;
            const apiKey = req.headers["x-api-key"];

            if (!apiKey || apiKey !== process.env.APP_SECRET_KEY) {
                res.status(403).json({ error: "Acesso não autorizado." });
                return;
            }

            if (!type) {
                res.status(400).json({ error: 'Tipo de ticket é obrigatório.' });
                return;
            }

            if (type !== 'NORMAL' && type !== 'PREFERENCIAL') {
                res.status(400).json({ error: 'Tipo de Ticket é inválido.' });
                return;
            }

            const ticket = await ticketService.generateTicket(type as TicketType);
            res.status(201).json(ticket);
            return;

        } catch (error) {
            next(error);
        }
    }

    async callNextTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceCounter } = req.body;

            if (!serviceCounter) {
                res.status(400).json({ error: 'Service counter is required' });
                return;
            }

            const ticket = await ticketService.callNextTicket(serviceCounter);
            res.status(200).json(ticket);
            return;
        } catch (error) {
            next(error);
        }
    }

    async callSpecificTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { number, serviceCounter } = req.body;

            if (!serviceCounter || !number) {
                res.status(400).json({ error: 'Service  or number is required' });
                return;
            }

            const ticket = await ticketService.callSpecificTicket(number, serviceCounter);
            res.status(200).json(ticket);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getTicketQueue(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketsNormal = await ticketService.getWaitingTickets("NORMAL" as TicketType);
            const ticketsPreferencial = await ticketService.getWaitingTickets("PREFERENCIAL" as TicketType);

            res.status(200).json({ ticketsNormal, ticketsPreferencial });
            return;
        } catch (error) {
            next(error);
        }
    }

    async getDisplayData(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ticketService.getDisplayData();
            res.status(200).json(data);
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = req.params.ticketId;

            if (!ticketId) {
                res.status(400).json({ error: 'ID de ticket é obrigatório.' });
                return;
            }

            await ticketService.deleteTicket(ticketId);
            res.status(200).json({ message: 'Ticket deletado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }

    async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const summary = await ticketService.getDashboardSumary();
            res.json(summary);
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default TicketController;