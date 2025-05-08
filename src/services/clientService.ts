import prisma from "../database";

class ClientService {

    async createClient(
        name: string,
        cpf: string,
        email?: string,
        phone?: string,
        rg?: string,
        dataNascimento?: Date,
        logradouro?: string,
        bairro?: string,
        cidade?: string,
        uf?: string,
        num?: number
    ) {
        const normalizedEmail = email?.trim() === '' ? null : email;
        const normalizedRG = rg?.trim() === '' ? null : rg;

        const existingClient = await prisma.client.findFirst({
            where: {
                OR: [
                    { cpf },
                    ...(normalizedRG ? [{ rg: normalizedRG }] : []),
                    ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
                ]
            }
        });

        if (existingClient) {
            throw new Error('Já existe um cliente cadastrado com esse email, CPF ou RG.');
        }

        const newClient = await prisma.client.create({
            data: {
                name,
                email: normalizedEmail,
                phone: phone?.trim() === '' ? null : phone,
                cpf,
                rg: normalizedRG,
                dataNascimento,
                logradouro: logradouro?.trim() === '' ? null : logradouro,
                bairro: bairro?.trim() === '' ? null : bairro,
                cidade: cidade?.trim() === '' ? null : cidade,
                uf: uf?.trim() === '' ? null : uf,
                num,
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

    async updatedClient(
        clientId: string,
        name: string,
        cpf: string,
        email?: string,
        phone?: string,
        rg?: string,
        dataNascimento?: Date,
        logradouro?: string,
        bairro?: string,
        cidade?: string,
        uf?: string,
        num?: number
    ) {
        const existingClient = await prisma.client.findUnique({ where: { id: clientId } });

        if (!existingClient) {
            throw new Error('Cliente não encontrado no banco de dados.');
        }

        await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                email: email ? email : existingClient.email,
                phone: phone ? phone : existingClient.phone,
                cpf: cpf ? cpf : existingClient.cpf,
                rg: rg ? rg : existingClient.rg,
                dataNascimento: dataNascimento ? dataNascimento : existingClient.dataNascimento,
                logradouro: logradouro ? logradouro : existingClient.logradouro,
                bairro: bairro ? bairro : existingClient.bairro,
                cidade: cidade ? cidade : existingClient.cidade,
                uf: uf ? uf : existingClient.uf,
                num: num ? num : existingClient.num,
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