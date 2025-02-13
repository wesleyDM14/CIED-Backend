import prisma from "../database";

class ClientService {

    async createClient(name: string, email?: string, phone?: string) {
        const existingClient = await prisma.client.findUnique({ where: { email } });

        if (existingClient) {
            throw new Error('Email já cadastrado no banco de dados.');
        }

        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                phone
            }
        });

        return newClient;
    }

    async getClients() {
        const clients = await prisma.client.findMany();
        return clients;
    }

    async getClientById(clientId: string) {
        const client = await prisma.client.findUnique({ where: { id: clientId } });

        if (!client) {
            throw new Error('Cliente não encontrado no banco de dados.');
        }

        return client;
    }

    async getClientByEmail(email: string) {
        const client = await prisma.client.findUnique({ where: { email } });

        if (!client) {
            throw new Error('Cliente não encontrado no banco de dados.');
        }

        return client;
    }

    async updatedClient(clientId: string, name: string, email?: string, phone?: string) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no banco de dados.');
        }

        await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                phone,
                email
            }
        });

        return;
    }

    async deleteClient(clientId: string) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no banco de dados.');
        }

        await prisma.client.delete({ where: { id: clientId } });
        return;
    }
}

export default ClientService;