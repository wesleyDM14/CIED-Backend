import { Request, Response, NextFunction } from "express";
import AtendimentoService from "../services/atendimentoService";

const atendimentoService = new AtendimentoService();

class AtendimentoController {
    async createAtendimento(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                clientId,
                ticketId,
                preco,
                metodoPagamento,
                observacoes,
                data,
                pressaoArterial,
                frequenciaCardiaca,
                temperatura,
                spo2,
                peso,
                altura,
                imc,
                queixaPrincipal,
                historiaClinica,
                exameFisico,
                hipoteseDiagnostica,
                conduta
            } = req.body;

            if (!ticketId || !clientId) {
                res.status(400).json({ error: `ID's de Ticket de atendimento e Cliente são obrigatórios.` });
                return;
            }

            const newAtendimento = await atendimentoService.createAtendimento(
                clientId,
                ticketId,
                preco,
                metodoPagamento,
                observacoes,
                data,
                {
                    pressaoArterial,
                    frequenciaCardiaca,
                    temperatura,
                    spo2,
                    peso,
                    altura,
                    imc,
                    queixaPrincipal,
                    historiaClinica,
                    exameFisico,
                    hipoteseDiagnostica,
                    conduta
                }
            );

            res.status(201).json(newAtendimento);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAtendimentos(req: Request, res: Response, next: NextFunction) {
        try {
            const atendimentos = await atendimentoService.getAtendimentos();

            res.status(200).json(atendimentos);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAtendimentosByClientId(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.params.clientId;

            if (!clientId) {
                res.status(400).json({ error: 'ID de cliente é obrigatório.' });
                return;
            }

            const atendimentos = await atendimentoService.getAtendimentosByClientId(clientId);

            res.status(200).json(atendimentos);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAtendimentosByProcedimentoId(req: Request, res: Response, next: NextFunction) {
        try {
            const procedimentoId = req.params.procedimentoId;

            if (!procedimentoId) {
                res.status(400).json({ error: 'ID de procedimento é obrigatório.' });
                return;
            }

            const atendimentos = await atendimentoService.getAtendimentosByProcedimentoId(procedimentoId);

            res.status(200).json(atendimentos);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAtendimentoById(req: Request, res: Response, next: NextFunction) {
        try {
            const atendimentoId = req.params.atendimentoId;

            if (!atendimentoId) {
                res.status(400).json({ error: 'ID de atendimento é obrigatório.' });
                return;
            }

            const atendimento = await atendimentoService.getAtendimentoById(atendimentoId);

            res.status(200).json(atendimento);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getAtendimentosByDate(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = req.body;

            if (!data) {
                res.status(400).json({ error: 'Data é obrigatório na requisição' });
            }

            const atendimentos = await atendimentoService.getAtendimentosByDate(data);

            res.status(200).json(atendimentos);
            return;
        } catch (error) {
            next(error);
        }
    }

    async updateAtendimento(req: Request, res: Response, next: NextFunction) {
        try {
            const atendimentoId = req.params.atendimentoId;

            if (!atendimentoId) {
                res.status(400).json({ error: 'ID de atendimento é obrigatório.' });
                return;
            }

            const {
                preco,
                metodoPagamento,
                observacoes,
                data,
                pressaoArterial,
                frequenciaCardiaca,
                temperatura,
                spo2,
                peso,
                altura,
                imc,
                queixaPrincipal,
                historiaClinica,
                exameFisico,
                hipoteseDiagnostica,
                conduta
            } = req.body;

            await atendimentoService.updateAtendimento(
                atendimentoId,
                preco,
                metodoPagamento,
                observacoes,
                data,
                {
                    pressaoArterial,
                    frequenciaCardiaca,
                    temperatura,
                    spo2,
                    peso,
                    altura,
                    imc,
                    queixaPrincipal,
                    historiaClinica,
                    exameFisico,
                    hipoteseDiagnostica,
                    conduta
                }
            );

            res.status(200).json({ message: 'Atendimento Atualizado com Sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteAtendimento(req: Request, res: Response, next: NextFunction) {
        try {
            const atendimentoId = req.params.atendimentoId;

            if (!atendimentoId) {
                res.status(400).json({ error: 'ID de atendimento é obrigatório' });
                return;
            }

            await atendimentoService.deleteAtendimento(atendimentoId);

            res.status(200).json({ message: 'Atendimento deletado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default AtendimentoController;