import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config();

const secretKey = process.env.JWT_SECRET || '05dffad7cd4eef5bdcd5ede297961c85197b99c86db50ab130ff02f17998d6d6';

export const generateToken = (payload: { userId: number; userType: string }): string => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); 
    console.log('Generated Token:', token);
    return token;
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};