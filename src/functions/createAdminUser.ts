import prisma from "../database";
import bcrypt from 'bcryptjs';

export const createAdminUser = async (email: string, password: string) => {
    const hashPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
        data: {
            email,
            role: "ADMIN",
            password: hashPassword
        }
    });
    return newAdmin;
}

export const createNormalUser = async (email: string, password: string) => {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email,
            role: "ADMIN",
            password: hashPassword
        }
    });
    return newUser;
}