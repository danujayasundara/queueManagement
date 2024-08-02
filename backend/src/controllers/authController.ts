import { Request, Response } from "express";
import { loginUser, logoutUser  } from "../services/authService";
import { CustomRequest } from "../types/session";

export const login = async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    try {
        const { token, userId, userType, counterId } = await loginUser(userName, password, req as CustomRequest);
        const response: any = { token, userId, userType };
        
        // Include counterId in response if it is defined
        if (counterId !== undefined) {
            (response as any).counterId = counterId;
        }

        return res.json({ response });
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'Invalid username or password') {
            return res.status(401).json({ message: 'Invalid username or password' });
        } else if (error.message === 'No counters available') {
            return res.status(400).json({ message: 'No counters available' });
        } else {
            return res.status(500).json({ message: 'Server error' });
        }
    }
};

export const logout = async (req: Request, res: Response) => {
    const { userId, userType } = req.body;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    try {
        const result = await logoutUser(userId, userType, req as CustomRequest);
        return res.status(200).send(result.message);
    } catch (error) {
        console.error('Error during logout process', error);
        return res.status(500).send('Error during logout process');
    }
};

//export default login;