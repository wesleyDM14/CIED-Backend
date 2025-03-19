import { MetodoPagamento, TicketStatus } from "@prisma/client";
import prisma from "../database";

class ProcedimentoService {

    async createProcedimento(nome: string, clientId: string, ticketNumber: string, description?: string, preco?: number, metodoPagamento?: MetodoPagamento) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no banco de dados');
        }

        const existingTicket = await prisma.ticket.findFirst({ where: { number: ticketNumber } });

        if (!existingTicket) {
            throw new Error("Senha não encontrada no banco de dados.");
        }

        const newProcedimento = await prisma.procedimento.create({
            data: {
                nome,
                clientId: existingClient.id,
                description,
                preco,
                metodoPagamento
            }
        });

        await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: {
                status: TicketStatus.FINISHED
            }
        });

        return newProcedimento;
    }

    async getProcedimentos() {
        const procedimentos = await prisma.procedimento.findMany();

        return procedimentos;
    }

    async getProcedimentosByClientId(clientId: string) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no banco de dados');
        }

        const procedimentos = await prisma.procedimento.findMany({
            where: { clientId },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return procedimentos;
    }

    async getProcedimentoById(procedimentoId: string) {
        const procedimento = await prisma.procedimento.findUnique({ where: { id: procedimentoId } });

        if (!procedimento) {
            throw new Error('Procedimento não encontrado no banco de dados.');
        }

        return procedimento;
    }

    async updateProcedimento(procedimentoId: string, nome: string, description?: string, preco?: number, metodoPagamento?: MetodoPagamento) {
        const procedimento = await prisma.procedimento.findUnique({ where: { id: procedimentoId } });

        if (!procedimento) {
            throw new Error('Procedimento não encontrado no banco de dados.');
        }

        await prisma.procedimento.update({
            where: { id: procedimento.id },
            data: {
                nome,
                description: description ? description : procedimento.description,
                preco: preco ? preco : procedimento.preco,
                metodoPagamento: metodoPagamento ? metodoPagamento : procedimento.metodoPagamento
            }
        });

        return;
    }

    async deleteProcedimento(procedimentoId: string) {
        const procedimento = await prisma.procedimento.findUnique({ where: { id: procedimentoId } });

        if (!procedimento) {
            throw new Error('Procedimento não encontrado no banco de dados.');
        }

        await prisma.procedimento.delete({
            where: { id: procedimento.id }
        });

        return;
    }
}

export default ProcedimentoService;