import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import  { verifyToken } from '../utils/auth';
import { CustomRequest } from '../types/session';

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = verifyToken(token) as { userId: number; userType: string };
        console.log('Decoded token:', decoded);
        if (decoded && decoded.userId) {
            req.session.userId = decoded.userId; // Set userId in session
            req.session.userType = decoded.userType; // Set userType in session
            next();
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;