import prisma from "../database";

import { MetodoPagamento } from "@prisma/client";

interface CamposMedicos {
    pressaoArterial?: number;
    frequenciaCardiaca?: number;
    temperatura?: number;
    spo2?: number;
    peso?: number;
    altura?: number;
    imc?: number;
    queixaPrincipal?: string;
    historiaClinica?: string;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    conduta?: string
}

class AtendimentoService {

    async createAtendimento(clientId: string, ticketId: string, preco: number, metodoPagamento: MetodoPagamento, observacoes: string, data: Date, camposMedicos?: CamposMedicos) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no Banco de Dados.');
        }

        const existingTicket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                procedimento: true
            }
        });

        if (!existingTicket) {
            throw new Error('Senha de Atendimento não cadastrada no Banco de Dados.');
        }

        const newAtendimento = await prisma.atendimento.create({
            data: {
                clientId,
                ticketId,
                preco,
                metodoPagamento,
                observacoes,
                data,
                procedimentoId: existingTicket.procedimento.id,
                ...camposMedicos
            }
        });

        return newAtendimento;
    }

    async getAtendimentos() {
        const atendimentos = await prisma.atendimento.findMany();
        return atendimentos;
    }

    async getAtendimentosByClientId(clientId: string) {
        const atendimentosByClient = await prisma.atendimento.findMany({
            where: { clientId }
        });

        return atendimentosByClient;
    }

    async getAtendimentosByProcedimentoId(procedimentoId: string) {
        const atendimentosByProcedimento = await prisma.atendimento.findMany({
            where: { procedimentoId }
        });

        return atendimentosByProcedimento;
    }

    async getAtendimentoById(atendimentoId: string) {
        const existingAtendimento = await prisma.atendimento.findUnique({
            where: { id: atendimentoId }
        });

        if (!existingAtendimento) {
            throw new Error('Atendimento não encontrado no Banco de Dados');
        }

        return existingAtendimento;
    }

    async getAtendimentosByDate(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const atendimentos = await prisma.atendimento.findMany({
            where: {
                data: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { data: 'asc' }
        });

        return atendimentos;
    }

    async updateAtendimento(atendimentoId: string, preco: number, metodoPagamento: MetodoPagamento, observacoes: string, data: Date, camposMedicos?: CamposMedicos) {
        const existingAtendimento = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });

        if (!existingAtendimento) {
            throw new Error('Atendimento não encontrado no Banco de Dados.');
        }

        await prisma.atendimento.update({
            where: { id: existingAtendimento.id },
            data: {
                preco,
                metodoPagamento,
                observacoes,
                data,
                ...camposMedicos
            }
        });

        return;
    }

    async deleteAtendimento(atendimentoId: string) {
        const existingAtendimento = await prisma.atendimento.findUnique({
            where: { id: atendimentoId }
        });

        if (!existingAtendimento) {
            throw new Error('Atendimento não encontrado no Banco de Dados');
        }

        await prisma.atendimento.delete({
            where: { id: existingAtendimento.id }
        });

        return;
    }

}

export default AtendimentoService;