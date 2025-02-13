import { Request, Response, NextFunction } from "express";
import ClientService from "../services/clientService";

const clientService = new ClientService();

class ClientController {

    async createClient(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, phone } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Nome é obrigatório.' });
                return;
            }

            const newClient = await clientService.createClient(name, email, phone);
            res.status(201).json(newClient);
            return;
        } catch (error) {
            next(error);
        }
    }

    async getClients(req: Request, res: Response, next: NextFunction) {
        try {
            const clients = clientService.getClients();
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

    async getClientByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;

            if (!email) {
                res.status(400).json({ error: 'Email de cliente é obrigatório.' });
            }

            const client = await clientService.getClientByEmail(email);
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

            const { name, email, phone } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Nome é obrigatório.' });
                return;
            }

            await clientService.updatedClient(clientId, name, email, phone);
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