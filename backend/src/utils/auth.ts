import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET || '05dffad7cd4eef5bdcd5ede297961c85197b99c86db50ab130ff02f17998d6d6';

export const generateToken = (userId: number) => {
    return jwt.sign({ userId }, secretKey, { expiresIn: '2h'});
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, secretKey) as JwtPayload;
};