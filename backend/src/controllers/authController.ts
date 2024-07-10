import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/auth";
import { User } from "../models/User";
import { io } from '../index';

export const login = async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { userName }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = generateToken(user.id);

        //emit login event
        io.emit('login', { userId: user.id, userType: user.userType });

        return res.json({ token, userType: user.userType });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};