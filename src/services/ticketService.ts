import { TicketStatus, TicketType } from "@prisma/client";
import prisma from "../database";

class TicketService {

    async generateTicket(ticketType: TicketType) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const ticketCount = await prisma.ticket.count({
            where: {
                createdAt: {
                    gte: todayStart
                }
            }
        });

        const sequenceNumber = ticketCount + 1;

        const paddedNumber = sequenceNumber.toString().padStart(3, '0');

        const prefix = ticketType === 'NORMAL' ? 'NS' : 'PS';

        const day = today.getDate().toString();

        const code = `${prefix}${day}${paddedNumber}`;

        const ticket = await prisma.ticket.create({
            data: {
                number: code,
                type: ticketType,
            }
        });

        return ticket;
    }

    async getWaitingTickets(ticketType: TicketType) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const tickets = await prisma.ticket.findMany({
            where: {
                type: ticketType,
                status: "WAITING",
                createdAt: {
                    gte: todayStart
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return tickets;
    }

    async getLastCalledTicket() {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const lastTicket = await prisma.ticket.findFirst({
            where: {
                status: { in: [TicketStatus.CALLED, TicketStatus.FINISHED] },
                createdAt: { gte: todayStart }
            },
            orderBy: { calledAt: 'desc' }
        });

        return lastTicket;
    }

    async callNextTicket(serviceCounter: string) {
        const preferentialTickets = await this.getWaitingTickets('PREFERENCIAL' as TicketType);
        const normalTickets = await this.getWaitingTickets('NORMAL' as TicketType);
        const lastCalled = await this.getLastCalledTicket();

        let ticketToCall = null;

        if (lastCalled) {
            if (lastCalled.type === 'NORMAL' && preferentialTickets.length > 0) {
                ticketToCall = preferentialTickets[0];
            } else if (lastCalled.type === 'PREFERENCIAL' && normalTickets.length > 0) {
                ticketToCall = normalTickets[0];
            } else {
                if (normalTickets.length > 0) {
                    ticketToCall = normalTickets[0];
                } else if (preferentialTickets.length > 0) {
                    ticketToCall = preferentialTickets[0];
                }
            }
        } else {
            if (preferentialTickets.length > 0) {
                ticketToCall = preferentialTickets[0];
            } else if (normalTickets.length > 0) {
                ticketToCall = normalTickets[0];
            }
        }

        if (!ticketToCall) {
            throw new Error('Nenhum ticket em espera');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketToCall.id },
            data: {
                status: TicketStatus.CALLED,
                stageOne: true,
                serviceCounter: serviceCounter,
                calledAt: new Date()
            }
        });

        return updatedTicket;
    }

    async secondCall(ticketId: string, room: string) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

        if (!ticket) {
            throw new Error('Ticket não encontrado.');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                stageTwo: true,
                room: room
            }
        });

        return updatedTicket;
    }

    async getDisplayData() {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const currentCalled = await prisma.ticket.findFirst({
            where: {
                status: { in: [TicketStatus.CALLED, TicketStatus.FINISHED] },
                createdAt: { gte: todayStart }
            },
            orderBy: { calledAt: 'desc' }
        });

        const lastCalledTickets = await prisma.ticket.findMany({
            where: {
                status: { in: [TicketStatus.CALLED, TicketStatus.FINISHED] },
                createdAt: { gte: todayStart }
            },
            orderBy: { calledAt: 'desc' },
            take: 5
        });

        return { currentCalled, lastCalledTickets };
    }

    async deleteTicket(ticketId: string) {
        const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

        if (!existingTicket) {
            throw new Error('Ticket não encontrado no Banco de Dados');
        }

        await prisma.ticket.delete({ where: { id: ticketId } });
        return;
    }
}

export default TicketService;