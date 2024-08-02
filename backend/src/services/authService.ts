import bcrypt from 'bcrypt';
import { Request } from 'express';
import { Session, SessionData } from 'express-session';
import { getUserByUsername } from '../daos/UserDao';
import { getCounterByUserId, findCounterById,  updateCounterUserIdAndStatus, getOpenCounters , getAvailableCounters } from "../daos/CounterDao";
import { generateToken } from '../utils/auth';
import { CustomRequest } from '../types/session';
import { User } from '../models/User';
import { findUnsolvedIssuesByCounter } from '../daos/IssueDao';
import { io } from '..';
import { resetStaticIndices, resetUnsolvedIssues, setUnsolvedIssues } from '../utils/staticIndexStore';
import { fetchAndAssignStaticIndices } from './IssueService';

const counterSessionMap: Map<number, number | null> = new Map();

export const assignCounterToUser = async (userId: number) => {
    const availableCounters = await getAvailableCounters();

    for (const counter of availableCounters) {
       if (counter.status === true && counter.cUserId === null) {
            await updateCounterUserIdAndStatus(counter, userId, false); 
            return counter.id;
        }
    }
    throw new Error('No counters available');
};

//login

export const loginUser = async (userName: string, password: string, req: CustomRequest) => {
    const user = await getUserByUsername(userName);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid username or password');
    }

    req.session.userId = user.id; // Set userId in session
    req.session.userType = user.userType; // Set userType in session

    const token = generateToken({ userId: user.id, userType: user.userType });

    if (user.userType === 'counter') {
        try {
            const counterId = await assignCounterToUser(user.id);
            
            await fetchAndAssignStaticIndices(counterId.toString());

            const unsolvedIssues = await findUnsolvedIssuesByCounter(counterId);
            const initialIssues = unsolvedIssues.map(issue => issue.id);

            // Emit event to reset and fetch new issues
            io.emit('counterLogin', { counterId: counterId, initialIssues });
            
            return { token, userId: user.id, userType: user.userType, counterId };
        } catch (error: any) {
            if (error.message === 'No counters available') {
                throw new Error('No counters available');
            }
            console.error('Login error:', error);
            throw new Error('Error during login process');
        }
    }

    return { token, userId: user.id, userType: user.userType };
};

export const logoutUser = async (userId: number, userType: string, req: CustomRequest) => {
    const counter = await getCounterByUserId(userId);
    if (userType === 'counter') {
        if (counter) {
            await updateCounterUserIdAndStatus (counter, null, true);
            resetStaticIndices(counter.id.toString());
            resetUnsolvedIssues(counter.id.toString());
            
            // Emit event to reset issues
            io.emit('counterLogout', { counterId: counter.id });

            counterSessionMap.set(counter.id, null); 
            return { message: 'Counter user logged out successfully' };
        } else {
            throw new Error('Counter not found');
        }
    } else {
        req.session.destroy((err: any) => {
            if (err) {
                throw new Error('Error destroying session');
            }
        });
        return { message: 'Normal user logged out successfully' };
    }
    
};
