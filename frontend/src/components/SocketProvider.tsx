import React, { useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface SocketProviderProps {
    children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    useEffect(() => {
        console.log('Connecting to socket server...');

        socket.on('connect', () => {
            console.log('Connected to socket server:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return <>{children}</>;
};

export { SocketProvider, socket };
