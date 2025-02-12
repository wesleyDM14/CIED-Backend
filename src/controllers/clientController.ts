import { Request, Response, NextFunction } from "express";
import ClientService from "../services/clientService";

const clientService = new ClientService();

class ClientController {

    async createClient(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async getClients(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async getClientById(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async updatedClient(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async deleteClient(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (error) {
            next(error);
        }
    }

}

export default ClientController;