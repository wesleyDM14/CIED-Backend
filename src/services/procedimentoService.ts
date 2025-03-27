import prisma from "../database";
class ProcedimentoService {

    async createProcedimento(nomeProfissional: string, description: string) {

        const newProcedimento = await prisma.procedimento.create({
            data: {
                nomeProfissional,
                description
            }
        });

        return newProcedimento;
    }

    async getProcedimentos() {
        const procedimentos = await prisma.procedimento.findMany({
            orderBy: { description: 'asc' }
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

    async updateProcedimento(procedimentoId: string, nomeProfissional: string, description: string) {
        const procedimento = await prisma.procedimento.findUnique({ where: { id: procedimentoId } });

        if (!procedimento) {
            throw new Error('Procedimento não encontrado no banco de dados.');
        }

        await prisma.procedimento.update({
            where: { id: procedimento.id },
            data: {
                nomeProfissional: nomeProfissional ? nomeProfissional : procedimento.nomeProfissional,
                description: description ? description : procedimento.description,
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