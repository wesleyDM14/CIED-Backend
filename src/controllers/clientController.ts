import { Request, Response, NextFunction } from "express";
import ClientService from "../services/clientService";

const clientService = new ClientService();

class ClientController {

    async createClient(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, phone, cpf, rg, dataNascimento, logradouro, bairro, cidade, uf, num } = req.body;

            if (!name || !cpf) {
                res.status(400).json({ error: 'Nome de cliente e CPF são obrigatórios.' });
                return;
            }

            const newClient = await clientService.createClient(name, cpf, email, phone, rg, dataNascimento, logradouro, bairro, cidade, uf, num);
            res.status(201).json(newClient);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getClients(req: Request, res: Response, next: NextFunction) {
        try {
            const clients = await clientService.getClients();
            res.status(200).json(clients);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getClientById(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.params.clientId;

            if (!clientId) {
                res.status(400).json({ error: 'ID de cliente é obrigatório.' });
            }

            const client = await clientService.getClientById(clientId);
            res.status(200).json(client);
            return;
        } catch (error) {
            next(error);
        }
    }

    async updatedClient(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.params.clientId;

            if (!clientId) {
                res.status(400).json({ error: 'ID de cliente é obrigatório.' });
                return;
            }

            const { name, cpf, email, phone, rg, dataNascimento, logradouro, bairro, cidade, uf, num } = req.body;

            if (!name || !cpf) {
                res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
                return;
            }

            await clientService.updatedClient(clientId, name, cpf, email, phone, rg, dataNascimento, logradouro, bairro, cidade, uf, num);
            res.status(200).json({ message: 'Cliente atualizado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }

    async deleteClient(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = req.params.clientId;

            if (!clientId) {
                res.status(400).json({ error: 'ID de cliente é obrigatório.' });
                return;
            }

            await clientService.deleteClient(clientId);
            res.status(200).json({ message: 'Cliente deletado com sucesso.' });
            return;
        } catch (error) {
            next(error);
        }
    }

}

export default ClientController;