import { TicketStatus, TicketType } from "@prisma/client";
import prisma from "../database";
import { io } from "../server";

class TicketService {

    private getTypePrefix(type: TicketType): string {
        return {
            NORMAL: 'N',
            PREFERENCIAL: 'P',
            AGENDAMENTO: 'AG'
        }[type];
    }

    async generateTicket(procedimentoId: string, type: TicketType): Promise<string> {
        const today = new Date();

        const lastTicket = await prisma.ticket.findFirst({
            where: { procedimentoId, type },
            orderBy: { createdAt: 'desc' }
        });

        const prefix = this.getTypePrefix(type);
        const day = today.getDate().toString();

        const sequence = lastTicket ? parseInt(lastTicket.number.split('-')[1]) + 1 : 1;

        const code = `${prefix}-${day}${sequence.toString().padStart(4, '0')}`;

        return code;
    }

    async createTicketWithScheduleCheck(procedimentoId: string, type: TicketType, scheduleDate: Date) {
        //io.emit("ticket:created", ticket);
    }

    async getWaitingTickets(ticketType: TicketType) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const tickets = await prisma.ticket.findMany({
            where: {
                type: ticketType,
                status: { in: ["WAITING", "CALLED"] },
                createdAt: { gte: todayStart }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'asc' }
            ]
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
        const preferentialTickets = (await this.getWaitingTickets('PREFERENCIAL' as TicketType))
            .filter(ticket => ticket.status !== TicketStatus.CALLED);

        const normalTickets = (await this.getWaitingTickets('NORMAL' as TicketType))
            .filter(ticket => ticket.status !== TicketStatus.CALLED);

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
                serviceCounter: serviceCounter,
                calledAt: new Date()
            }
        });

        io.emit("ticket:called", {
            number: updatedTicket.number,
            serviceCounter: updatedTicket.serviceCounter
        });

        return updatedTicket;
    }

    async callSpecificTicket(number: string, serviceCounter: string) {
        const ticket = await prisma.ticket.findFirst({ where: { number } });

        if (!ticket) {
            throw new Error('Ticket não encontrado no banco de dados.');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: TicketStatus.CALLED,
                serviceCounter: serviceCounter,
                calledAt: new Date()
            }
        });

        io.emit("ticket:called", {
            number: updatedTicket.number,
            serviceCounter: updatedTicket.serviceCounter
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

    async cancelExpiredTickets(ticketId: string) {
        const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });

        if (!existingTicket) {
            throw new Error('Ticket não encontrado no Banco de Dados');
        }

        await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: {
                status: 'CANCELED'
            }
        });

        return;
    }

    async getDashboardSumary() {

        const allTickets = await prisma.ticket.findMany({
            select: {
                type: true,
                status: true,
                createdAt: true,
            },
        });

        const today = new Date();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());

        const weeklyTickets = allTickets.filter(ticket =>
            new Date(ticket.createdAt) >= firstDayOfWeek
        );

        const dailyCounts: Record<string, number> = {
            "dom": 0, "seg": 0, "ter": 0, "qua": 0, "qui": 0, "sex": 0, "sáb": 0
        };

        weeklyTickets.forEach((ticket) => {
            const day = new Date(ticket.createdAt).toLocaleString("pt-BR", { weekday: "short" }).replace(".", "");
            if (dailyCounts[day] !== undefined) dailyCounts[day]++;
        });

        // Cálculo para pizza e média (GERAL)
        let normalCount = 0;
        let preferencialCount = 0;

        allTickets.forEach((ticket) => {
            if (ticket.type === "NORMAL") normalCount++;
            if (ticket.type === "PREFERENCIAL") preferencialCount++;
        });

        // Cálculo da média geral
        const totalDays = allTickets.length > 0
            ? Math.ceil(
                (new Date().getTime() - Math.min(...allTickets.map(t => t.createdAt.getTime()))) /
                (1000 * 3600 * 24)
            )
            : 0;

        const average = totalDays > 0 ?
            (allTickets.length / totalDays).toFixed(1)
            : 0;

        const statusCounts = {
            total: allTickets.length,
            finished: allTickets.filter(t => t.status === 'FINISHED').length,
            canceled: allTickets.filter(t => t.status === 'CANCELED').length,
            waiting: allTickets.filter(t => t.status === 'WAITING').length,
            called: allTickets.filter(t => t.status === 'CALLED').length
        };

        return {
            dailyData: Object.keys(dailyCounts).map(day => ({ day, atendimentos: dailyCounts[day] })),
            attendanceBreakdown: [
                { type: "Normal", count: normalCount },
                { type: "Preferencial", count: preferencialCount }
            ],
            averageAttendances: average,
            statusDistribution: [
                { status: 'Finalizadas', count: statusCounts.finished },
                { status: 'Canceladas', count: statusCounts.canceled },
                { status: 'Pendentes', count: statusCounts.waiting + statusCounts.called }
            ],
            totalTickets: statusCounts.total
        };
    }
}

export default TicketService;