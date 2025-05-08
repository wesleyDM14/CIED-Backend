import { TicketStatus, TicketType } from "@prisma/client";
import prisma from "../database";
import { io } from "../server";
import { addDays, isWithinInterval, startOfWeek } from 'date-fns';
import { DateTime } from "luxon";


class TicketService {

    private getTypePrefix(type: TicketType): string {
        return {
            NORMAL: 'N',
            PREFERENCIAL: 'P',
            AGENDAMENTO: 'AG'
        }[type];
    }

    private generateProcedimentoPrefix(name: string): string {
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase(); // Ex: "RaioX" => "RA"
        }
        return words.map(w => w[0].toUpperCase()).join('').substring(0, 3); // Ex: "Exame Sangue" => "ES"
    }

    private async isProcedimentoDisponivelNoMes(procedimentoId: string, mes: number, ano: number) {
        const agendaMensal = await prisma.dailySchedule.findMany({
            where: {
                date: {
                    gte: new Date(ano, mes - 1, 1),
                    lt: new Date(ano, mes, 1),
                },
            },
            include: {
                procedimentos: {
                    include: {
                        procedimento: true,
                    },
                },
            },
        });

        return agendaMensal.some(agenda =>
            agenda.procedimentos.some(p => p.procedimentoId === procedimentoId)
        );
    }

    async generateTicket(procedimentoId: string, type: TicketType): Promise<string> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const procedimento = await prisma.procedimento.findUnique({
            where: { id: procedimentoId },
        });

        if (!procedimento) {
            throw new Error('Procedimento não encontrado.');
        }

        const prefixType = this.getTypePrefix(type); // Ex: N, P, AG
        const procPrefix = this.generateProcedimentoPrefix(procedimento.description); // Ex: FO, EX

        const prefix = `${procPrefix}-${prefixType}`; // Ex: FO-N, FO-P

        const lastTicket = await prisma.ticket.findFirst({
            where: {
                procedimentoId,
                type,
                createdAt: { gte: startOfDay }
            },
            orderBy: { createdAt: 'desc' }
        });

        const sequence = lastTicket
            ? parseInt(lastTicket.code.split('-')[1]?.slice(1)) + 1
            : 1;

        const code = `${prefix}${sequence.toString().padStart(2, '0')}`; // Ex: FO-N01

        return code;
    }

    async createTicket(procedimentoId: string, type: TicketType) {
        const isAvailable = await prisma.dailySchedule.findFirst({
            where: {
                date: { lte: new Date() },
                procedimentos: { some: { procedimentoId } }
            },
            orderBy: { date: 'desc' }
        });

        if (!isAvailable) {
            throw new Error('Procedimento não disponível hoje.');
        }

        const code = await this.generateTicket(procedimentoId, type);

        const newTicket = await prisma.ticket.create({
            data: {
                code,
                type,
                status: 'WAITING',
                procedimentoId
            },
            include: {
                procedimento: true
            }
        });

        io.emit("ticket:created", newTicket);
        return newTicket;
    }

    async createScheduledTicket(procedimentoId: string, scheduleDate: Date) {
        const mes = scheduleDate.getMonth() + 1;
        const ano = scheduleDate.getFullYear();

        const isDisponivel = await this.isProcedimentoDisponivelNoMes(procedimentoId, mes, ano);

        const code = await this.generateTicket(procedimentoId, TicketType.AGENDAMENTO);

        const newTicket = await prisma.ticket.create({
            data: {
                code,
                type: TicketType.AGENDAMENTO,
                status: 'WAITING',
                procedimentoId,
                scheduleAt: scheduleDate,
            },
        });

        io.emit("agendamento:created", newTicket);
        return newTicket;
    }

    async getWaitingTickets(ticketType: TicketType) {
        // 1. Cria o início do dia no fuso do Brasil
        const todayStartBR = DateTime.now()
            .setZone('America/Sao_Paulo') // Define o fuso correto
            .startOf('day') // Meia-noite no horário brasileiro
            .toJSDate(); // Converte para Date do JS

        // 2. Consulta usando o horário ajustado
        const tickets = await prisma.ticket.findMany({
            where: {
                type: ticketType,
                status: { in: ["WAITING", "CALLED"] },
                createdAt: { gte: todayStartBR }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        return tickets;
    }

    async getLastCalledTicket(procedimentoId: string) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const lastTicket = await prisma.ticket.findFirst({
            where: {
                status: TicketStatus.CALLED,
                procedimentoId: procedimentoId,
                createdAt: { gte: todayStart }
            },
            orderBy: { calledAt: 'desc' }
        });

        return lastTicket;
    }

    async callNextTicket(serviceCounter: string, procedimentoId: string) {
        const preferentialTickets = (await this.getWaitingTickets(TicketType.PREFERENCIAL))
            .filter(ticket => ticket.status !== TicketStatus.CALLED && ticket.procedimentoId === procedimentoId);

        const normalTickets = (await this.getWaitingTickets(TicketType.NORMAL))
            .filter(ticket => ticket.status !== TicketStatus.CALLED && ticket.procedimentoId === procedimentoId);

        const lastCalled = await this.getLastCalledTicket(procedimentoId);

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
            number: updatedTicket.code,
            serviceCounter: updatedTicket.serviceCounter,
            procedimentoId: updatedTicket.procedimentoId
        });

        return updatedTicket;
    }

    async callSpecificTicket(code: string, serviceCounter: string) {
        const ticket = await prisma.ticket.findFirst({ where: { code } });

        if (!ticket) {
            throw new Error('Ticket não encontrado no banco de dados.');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: TicketStatus.CALLED,
                serviceCounter: serviceCounter,
                calledAt: new Date()
            },
            include: {
                procedimento: true
            }
        });

        io.emit("ticket:called", {
            number: updatedTicket.code,
            serviceCounter: updatedTicket.serviceCounter
        });

        return updatedTicket;
    }

    async getDisplayData() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const currentCalled = await prisma.ticket.findFirst({
            where: {
                status: TicketStatus.CALLED,
                createdAt: { gte: todayStart }
            },
            orderBy: { calledAt: 'desc' }
        });

        const lastCalledTickets = await prisma.ticket.findMany({
            where: {
                status: TicketStatus.CALLED,
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
                { status: 'Canceladas', count: statusCounts.canceled },
                { status: 'Pendentes', count: statusCounts.waiting },
                { status: 'Chamadas', count: statusCounts.called }
            ],
            totalTickets: statusCounts.total
        };
    }

    async getQueue() {

        const todayStartBR = DateTime.now()
            .setZone('America/Sao_Paulo') // Define o fuso correto
            .startOf('day') // Meia-noite no horário brasileiro
            .toJSDate();

        const daily = await prisma.dailySchedule.findFirst({
            where: {
                date: todayStartBR
            },
            include: {
                procedimentos: {
                    include: {
                        procedimento: true
                    }
                }
            }
        });

        if (!daily) return [];

        const filas = [];

        for (const sp of daily.procedimentos) {
            const procedimento = sp.procedimento;

            const tickets = await prisma.ticket.findMany({
                where: {
                    procedimentoId: procedimento.id,
                    status: { in: ["WAITING", "CALLED"] },
                    createdAt: { gte: todayStartBR }
                },
                orderBy: { createdAt: 'asc' }
            });

            const normal = tickets.filter(t => t.type === TicketType.NORMAL);
            const preferencial = tickets.filter(t => t.type === TicketType.PREFERENCIAL);

            filas.push({
                procedimentoId: procedimento.id,
                nome: procedimento.description,
                profissional: procedimento.nomeProfissional,
                normal,
                preferencial
            });
        }

        return filas;
    }

    async finalizeTicket(ticketId: string) {
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
}

export default TicketService;