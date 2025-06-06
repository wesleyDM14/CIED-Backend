import { NextFunction, Request, Response } from "express";
import ProcedimentoService from "../services/procedimentoService";

const procedimentoService = new ProcedimentoService();

class ProcedimentoController {

    async createProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const { nomeProfissional, description } = req.body;

            if (!nomeProfissional || !description) {
                res.status(400).json({ error: 'Dados obrigatórios estao faltando.' });
                return;
            }

            const newProcedimento = await procedimentoService.createProcedimento(nomeProfissional, description);

            res.status(201).json(newProcedimento);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getProcedimentos(req: Request, res: Response, next: NextFunction) {
        try {
            const procedimentos = await procedimentoService.getProcedimentos();
            res.status(200).json(procedimentos);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getProcedimentoById(req: Request, res: Response, next: NextFunction) {
        try {
            const procedimentoId = req.params.procedimentoId;

            if (!procedimentoId) {
                res.status(400).json({ error: 'ID de procedimento é obrigatório.' });
                return;
            }

            const procedimento = await procedimentoService.getProcedimentoById(procedimentoId);
            res.status(200).json(procedimento);
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const procedimentoId = req.params.procedimentoId;

            if (!procedimentoId) {
                res.status(400).json({ error: 'ID de procedimento é obrigatório.' });
                return;
            }

            const { nomeProfissional, description } = req.body;

            if (!nomeProfissional || !description) {
                res.status(400).json({ error: 'Dados obrigatórios estao faltando.' });
                return;
            }

            await procedimentoService.updateProcedimento(procedimentoId, nomeProfissional, description);
            res.status(200).json({ message: 'Procedimento atualizado com sucesso.' });
            return;

        } catch (error) {
            next(error);
        }
    }

    async deleteProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const procedimentoId = req.params.procedimentoId;

            if (!procedimentoId) {
                res.status(400).json({ error: 'ID de procedimento é obrigatório.' });
                return;
            }

            await procedimentoService.deleteProcedimento(procedimentoId);

            res.status(200).json({ message: 'Procedimento deletado com sucesso.' });
            return;

        } catch (error) {
            next(error);
        }
    }
}

export default ProcedimentoController;