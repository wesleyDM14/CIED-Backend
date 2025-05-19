import prisma from "../database";
import { io } from "../server";

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

            const existingShcedule = await prisma.dailySchedule.findUnique({
                where: { date: e.date }
            });

            if (existingShcedule) {
                await prisma.scheduleProcedimento.deleteMany({ where: { dailyScheduleId: existingShcedule.id } });

                return await prisma.dailySchedule.update({
                    where: { date: e.date },
                    data: {
                        procedimentos: {
                            createMany: {
                                data: procedimentosExistentes.map((procedimento) => ({
                                    procedimentoId: procedimento.id,
                                })),
                            },
                        },
                    }
                })
            } else {
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
            }

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

        const existingShcedule = await prisma.dailySchedule.findUnique({
            where: { date: date }
        });

        let response = null;

        if (existingShcedule) {
            await prisma.scheduleProcedimento.deleteMany({ where: { dailyScheduleId: existingShcedule.id } });


            response = await prisma.dailySchedule.update({
                where: { date: date },
                data: {
                    procedimentos: {
                        createMany: {
                            data: procedimentosExistentes.map((procedimento) => ({
                                procedimentoId: procedimento.id,
                            })),
                        },
                    },
                }
            })
        } else {
            response = await prisma.dailySchedule.create({
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
        io.emit('agenda-atualizada', date.toISOString());
        return response;
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
        const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

        return await prisma.dailySchedule.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
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
        const response = await prisma.scheduleProcedimento.deleteMany({
            where: {
                dailyScheduleId: scheduleId,
                procedimentoId,
            },
        });

        io.emit('agenda-atualizada', new Date().toISOString());

        return response;
    }
}

export default AgendaService;