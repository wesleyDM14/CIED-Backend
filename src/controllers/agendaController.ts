import { Request, Response, NextFunction } from "express";
import AgendaService from "../services/agendaService";

const agendaService = new AgendaService();

class AgendaController {

    async registrarAgendaMensal(req: Request, res: Response, next: NextFunction) {
        try {
            const { procedimentosPorDia } = req.body;

            if (!Array.isArray(procedimentosPorDia) || procedimentosPorDia.length === 0) {
                res.status(400).json({ error: "O array de procedimentos é obrigatório e não pode etar vazio" });
                return;
            }

            const agenda = await agendaService.registrarAgendaMensal(procedimentosPorDia);
            res.status(201).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async registrarAgendaSemanal(req: Request, res: Response, next: NextFunction) {
        try {
            const { procedimentosPorDia } = req.body;
            if (!Array.isArray(procedimentosPorDia) || procedimentosPorDia.length === 0) {
                res.status(400).json({ message: "O array de procedimentos é obrigatório e não pode estar vazio." });
                return;
            }

            const agenda = await agendaService.registrarAgendaSemanal(procedimentosPorDia);
            res.status(201).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async registrarAgendaDiaria(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, procedimentos } = req.body;

            if (!date || !Array.isArray(procedimentos) || procedimentos.length === 0) {
                res.status(400).json({ error: 'Data e procedimentos são obrigatórios.' });
                return;
            }

            const agenda = await agendaService.registrarAgendaDiaria(new Date(date), procedimentos);
            res.status(201).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAgendaMensal(req: Request, res: Response, next: NextFunction) {
        try {
            const { month, year } = req.query;

            if (!month || !year) {
                res.status(400).json({ message: "Mês e ano são obrigatórios." });
                return;
            }

            const agenda = await agendaService.getAgendaMensal(Number(month), Number(year));
            res.status(200).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAgendaSemanal(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(400).json({ message: "Datas de início e fim são obrigatórias." });
                return;
            }

            const agenda = await agendaService.getAgendaSemanal(new Date(startDate as string), new Date(endDate as string));
            res.status(200).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAgendaDiaria(req: Request, res: Response, next: NextFunction) {
        try {
            const { date } = req.query;

            if (!date) {
                res.status(400).json({ message: "A data é obrigatória." });
                return;
            }

            const agenda = await agendaService.getAgendaDiaria(new Date(date as string));
            
            res.status(200).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async editarAgendaMensal(req: Request, res: Response, next: NextFunction) {
        try {
            const { scheduleId } = req.params;
            const { procedimentos } = req.body;

            if (!scheduleId || !Array.isArray(procedimentos) || procedimentos.length === 0) {
                res.status(400).json({ message: "ID da agenda e lista de procedimentos são obrigatórios." });
                return;
            }

            const agenda = await agendaService.editarAgendaDiaria(scheduleId, procedimentos);
            res.status(200).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async acrescentarProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const { scheduleId, procedimentoId } = req.body;
            if (!scheduleId || !procedimentoId) {
                res.status(400).json({ message: "ID da agenda e do procedimento são obrigatórios." });
                return;
            }

            const agenda = await agendaService.acrescentarProcedimento(scheduleId, procedimentoId);
            res.status(200).json(agenda);
            return;
        } catch (error) {
            next(error);
        }
    }

    async removerProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const { scheduleId, procedimentoId } = req.params;
            if (!scheduleId || !procedimentoId) {
                res.status(400).json({ message: "ID da agenda e do procedimento são obrigatórios." });
                return;
            }

            await agendaService.removerProcedimento(scheduleId, procedimentoId);
            res.status(200).json({ message: 'Procedimento removido com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default AgendaController;