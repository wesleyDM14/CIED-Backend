import prisma from "../database";

class AgendaService {

    async registrarAgendaMensal(procedimentosPorDia: { date: Date, procedimentos: { procedimentoId: string }[] }[]) {
        return await Promise.all(procedimentosPorDia.map(async (e) => {
            const procedimentosExistentes = await Promise.all(
                e.procedimentos.map(async ({ procedimentoId }) => {
                    const procedimento = await prisma.procedimento.findUnique({
                        where: { id: procedimentoId },
                    });

                    if (!procedimento) {
                        throw new Error(`Procedimento com ID ${procedimentoId} não encontrado no Banco de Dados.`);
                    }

                    return procedimento;
                })
            );

            return await prisma.dailySchedule.create({
                data: {
                    date: e.date,
                    procedimentos: {
                        createMany: {
                            data: procedimentosExistentes.map((procedimento) => ({
                                procedimentoId: procedimento.id,
                            })),
                        },
                    },
                },
            });
        }));
    }

    async registrarAgendaSemanal(procedimentosPorDia: { date: Date, procedimentos: { procedimentoId: string }[] }[]) {
        return await Promise.all(procedimentosPorDia.map(async (e) => {
            const procedimentosExistentes = await Promise.all(
                e.procedimentos.map(async ({ procedimentoId }) => {
                    const procedimento = await prisma.procedimento.findUnique({
                        where: { id: procedimentoId },
                    });

                    if (!procedimento) {
                        throw new Error(`Procedimento com ID ${procedimentoId} não encontrado no Banco de Dados.`);
                    }

                    return procedimento;
                })
            );

            return await prisma.dailySchedule.create({
                data: {
                    date: e.date,
                    procedimentos: {
                        createMany: {
                            data: procedimentosExistentes.map((procedimento) => ({
                                procedimentoId: procedimento.id,
                            })),
                        },
                    },
                },
            });
        }));
    }

    async registrarAgendaDiaria(date: Date, procedimentos: { procedimentoId: string }[]) {
        const procedimentosExistentes = await Promise.all(
            procedimentos.map(async ({ procedimentoId }) => {
                const procedimento = await prisma.procedimento.findUnique({
                    where: { id: procedimentoId },
                });

                if (!procedimento) {
                    throw new Error(`Procedimento com ID ${procedimentoId} não encontrado`);
                }

                return procedimento;
            })
        );

        return await prisma.dailySchedule.create({
            data: {
                date,
                procedimentos: {
                    createMany: {
                        data: procedimentosExistentes.map((procedimento) => ({
                            procedimentoId: procedimento.id,
                        })),
                    },
                },
            },
        });
    }

    async getAgendaMensal(month: number, year: number) {
        return await prisma.dailySchedule.findMany({
            where: {
                date: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
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
    }

    async getAgendaSemanal(startDate: Date, endDate: Date) {
        return await prisma.dailySchedule.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
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
    }

    async getAgendaDiaria(date: Date) {
        return await prisma.dailySchedule.findFirst({
            where: { date },
            include: {
                procedimentos: {
                    include: {
                        procedimento: true,
                    },
                },
            },
        });
    }

    async editarAgendaDiaria(scheduleId: string, procedimentos: { procedimentoId: string }[]) {
        await prisma.scheduleProcedimento.deleteMany({ where: { dailyScheduleId: scheduleId } });

        const procedimentosExistentes = await Promise.all(
            procedimentos.map(async ({ procedimentoId }) => {
                const procedimento = await prisma.procedimento.findUnique({
                    where: { id: procedimentoId }
                });

                if (!procedimento) {
                    throw new Error(`Procedimento com ID ${procedimentoId} não encontrado.`);
                }

                return procedimento;
            })
        );

        return await prisma.scheduleProcedimento.createMany({
            data: procedimentosExistentes.map(e => ({
                dailyScheduleId: scheduleId,
                procedimentoId: e.id,
            })),
        });
    }

    async acrescentarProcedimento(scheduleId: string, procedimentoId: string) {
        const procedimentoExisting = await prisma.procedimento.findUnique({ where: { id: procedimentoId } });

        if (!procedimentoExisting) {
            throw new Error('Procedimento não encontrado no Banco de Dados.');
        }

        return await prisma.scheduleProcedimento.create({
            data: {
                dailyScheduleId: scheduleId,
                procedimentoId,
            },
        });
    }

    async removerProcedimento(scheduleId: string, procedimentoId: string) {
        return await prisma.scheduleProcedimento.deleteMany({
            where: {
                dailyScheduleId: scheduleId,
                procedimentoId,
            },
        });
    }
}

export default AgendaService;