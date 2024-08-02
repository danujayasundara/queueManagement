import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { join } from 'path';
import cors from 'cors';
import { createServer } from 'http';
import http from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import newIssueRoutes from './routes/newIssueRoutes';
import counterRoutes from './routes/counterRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { CustomRequest, CustomSession } from './types/session';
import { getUsersOfCounter } from './daos/IssueDao';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.JWT_SECRET || '05dffad7cd4eef5bdcd5ede297961c85197b99c86db50ab130ff02f17998d6d6', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },// Set secure: true if using HTTPS
}));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    },
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join', (userId: number) => {
        socket.join(String(userId));
        console.log(`User ${userId} joined room: ${userId}`);
    });

    socket.on('issueFixed', (data) => {
        console.log('Received issueFixed event from client:', data);
        io.emit('issueFixed', data); // Broadcast to all clients
    });

    socket.on('counterClosed', (data) => {
        console.log('Received counterClosed event:', data);
        io.emit('counterClosed', data); 
    });

    socket.on('newIssueSubmitted', (data) => {
        console.log('Received newIssueSubmitted event:', data);
        io.emit('newIssueSubmitted', data); 
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

//emit new issue 
export const emitNewIssue = (counterId: number, issue: any) => {
    io.emit('newIssue', { counterId, issue });
};

export const emitMyIssueIndexUpdate = (userId: number, issueIndex: number) => {
    console.log(`Emitting updateMyIssueIndex event for userId: ${userId} with issueIndex: ${issueIndex}`);
    io.to(String(userId)).emit('updateMyIssueIndex', { issueIndex });
};


//emit new notifications
export const notifyNewNotification = () => {
    io.emit('newNotification');
};

app.get('/', (req, res) => {
    res.send('Queue Management System backend..');
});

app.use('/auth', authRoutes);
app.use('/issue', newIssueRoutes);
app.use('/counter', counterRoutes);
app.use('/notification', notificationRoutes);

app.post('/issue/unsolved', (req, res) => {
    console.log('Received request on /issue/unsolved with data:', req.body);
    res.status(404).send('This endpoint is no longer available');
  });

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', err);
    res.status(500).json({ message: 'Server error' });
});

AppDataSource.initialize().then(() => {
    console.log('Connected to the database');

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
}).catch(error => console.log(error));

export { app, server, io };