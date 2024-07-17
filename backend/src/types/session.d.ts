import { Request } from 'express';
import { Session } from 'express-session';

export interface CustomSession extends Session {
    userId: number;
    userType: string;
}

declare module 'express-session' {
    interface SessionData {
        userId: number;
        userType: string;
    }
}

export interface CustomRequest extends Request {
    session: session.Session & Partial<session.SessionData> & { userId: number; userType: string };
}