import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/data-source';
import { generateToken, verifyToken } from './utils/auth';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg);
    });
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Queue Management System backend..');
});

app.use('/auth', authRoutes);

AppDataSource.initialize().then(() => {
    console.log('Connected to the database');

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    });
}).catch(error => console.log(error));

export { io };