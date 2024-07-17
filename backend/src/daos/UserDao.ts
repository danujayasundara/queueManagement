import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";

const userRepository = AppDataSource.getRepository(User);

export const getUserByUsername = async (userName: string): Promise<User | null> => {
    return userRepository.findOne({ where: { userName }});
};

export const findUserById = async (userId: number) => {
    return await userRepository.findOneBy({ id: userId });
};