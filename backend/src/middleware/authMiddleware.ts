import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import  { verifyToken } from '../utils/auth';

//const secretKey = '';
interface CustomRequest extends Request {
    user?: number;
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = verifyToken(token) as JwtPayload;
        if (decoded && decoded.userId) {
            req.user = decoded.userId;
        }
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;