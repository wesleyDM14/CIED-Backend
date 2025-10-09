import { NextFunction, Request, Response } from "express";
import TicketService from "../services/ticketService";
import { TicketType } from "@prisma/client";

const ticketService = new TicketService();

class TicketController {

    async createTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { type, procedimentoId } = req.body;
            const apiKey = req.headers["x-api-key"];

            if (!apiKey || apiKey !== process.env.APP_SECRET_KEY) {
                res.status(403).json({ error: "Acesso não autorizado." });
                return;
            }
            if (!type) {
                res.status(400).json({ error: 'Tipo de ticket é obrigatório.' });
                return;
            }
            if (!procedimentoId) {
                res.status(400).json({ error: 'Procedimento é obrigatório.' });
                return;
            }
            if (type !== 'NORMAL' && type !== 'PREFERENCIAL' && type !== 'AGENDAMENTO' && type !== 'IDOSO_80_MAIS') {
                res.status(400).json({ error: 'Tipo de Ticket é inválido.' });
                return;
            }
            const ticket = await ticketService.createTicket(procedimentoId, type);
            res.status(201).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async createTicketFromWebApp(req: Request, res: Response, next: NextFunction) {
        try {
            const { type, procedimentoId } = req.body;
            if (!type) {
                res.status(400).json({ error: 'Tipo de ticket é obrigatório.' });
                return;
            }
            if (!procedimentoId) {
                res.status(400).json({ error: 'Procedimento é obrigatório.' });
                return;
            }
            if (type !== 'NORMAL' && type !== 'PREFERENCIAL' && type !== 'AGENDAMENTO' && type !== 'IDOSO_80_MAIS') {
                res.status(400).json({ error: 'Tipo de Ticket é inválido.' });
                return;
            }
            const ticket = await ticketService.createTicket(procedimentoId, type);
            res.status(201).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async createScheduledTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { scheduleDate, procedimentoId } = req.body;
            if (!procedimentoId || !scheduleDate) {
                res.status(400).json({ error: 'Procedimento e Data são obrigatórios.' });
                return;
            }
            const data = new Date(scheduleDate);
            const ticketAgendamento = await ticketService.createScheduledTicket(procedimentoId, data);
            res.status(201).json(ticketAgendamento);
        } catch (error) {
            next(error);
        }
    }

    async callNextTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { corredor, procedimentoId } = req.body;
            if (!procedimentoId) {
                res.status(400).json({ error: 'Procedimento é obrigatório' });
                return;
            }
            if (!corredor) {
                res.status(400).json({ error: 'Corredor é obrigatório' });
                return;
            }
            const ticket = await ticketService.callNextTicket(procedimentoId, corredor);
            res.status(200).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async callSpecificTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const { number, corredor } = req.body;
            if (!corredor || !number) {
                res.status(400).json({ error: 'Número da senha e corredor são obrigatórios' });
                return;
            }
            const ticket = await ticketService.callSpecificTicket(number, corredor);
            res.status(200).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async getTicketQueue(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketsNormal = await ticketService.getWaitingTickets("NORMAL" as TicketType);
            const ticketsPreferencial = await ticketService.getWaitingTickets("PREFERENCIAL" as TicketType);
            const ticketsAgendamento = await ticketService.getWaitingTickets("AGENDAMENTO" as TicketType);
            const ticketsIdoso80Mais = await ticketService.getWaitingTickets("IDOSO_80_MAIS" as TicketType);

            res.status(200).json({ ticketsNormal, ticketsPreferencial, ticketsAgendamento, ticketsIdoso80Mais });
        } catch (error) {
            next(error);
        }
    }

    async getDisplayData(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ticketService.getDisplayData();
            res.status(200).json(data);
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
        } catch (error) {
            next(error);
        }
    }

    async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const summary = await ticketService.getDashboardSumary();
            res.json(summary);
        } catch (error) {
            next(error);
        }
    }

    async getQueue(req: Request, res: Response, next: NextFunction) {
        try {
            const filas = await ticketService.getQueue();
            res.json(filas);
        } catch (error) {
            next(error);
        }
    }

    async finalizeTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = req.params.ticketId;
            if (!ticketId) {
                res.status(400).json({ error: 'ID de ticket é obrigatório.' });
                return;
            }
            await ticketService.finalizeTicket(ticketId);
            res.status(200).json({ message: 'Ticket finalizado com sucesso.' }); // Mensagem ajustada
        } catch (error) {
            next(error);
        }
    }
}

export default TicketController;