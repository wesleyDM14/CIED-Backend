import { NextFunction, Request, Response } from "express";
import ProcedimentoService from "../services/procedimentoService";

const procedimentoService = new ProcedimentoService();

class ProcedimentoController {

    async createProcedimento(req: Request, res: Response, next: NextFunction) {
        try {
            const { nome, clientId, description, preco, metodoPagamento } = req.body;

            if (!nome || !clientId) {
                res.status(400).json({ error: 'Dados obrigatórios estao faltando.' });
                return;
            }

            const newProcedimento = await procedimentoService.createProcedimento(nome, clientId, description, preco, metodoPagamento);

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

    async getProcedimentosByClientId(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.params.clientId;

            if (!clientId) {
                res.status(400).json({ error: 'ID de cliente é obrigatório.' });
                return;
            }

            const procedimentos = await procedimentoService.getProcedimentosByClientId(clientId);
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

            const { nome, description, preco, metodoPagamento } = req.body;

            if (!nome) {
                res.status(400).json({ error: 'Dados obrigatórios estao faltando.' });
                return;
            }

            await procedimentoService.updateProcedimento(procedimentoId, nome, description, preco, metodoPagamento);
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