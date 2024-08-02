import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import io from 'socket.io-client';

const token = sessionStorage.getItem('token');

interface NotificationContextProps {
    unseenCount: number;
    fetchUnseenCount: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
    unseenCount: 0,
    fetchUnseenCount: () => {},
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [unseenCount, setUnseenCount] = useState(0);

    const fetchUnseenCount = async () => {
        const userId = sessionStorage.getItem('userId');
        try {
            const response = await axios.post('http://localhost:3000/notifications/unseen-count', { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUnseenCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unseen notification count', error);
        }
    };

    useEffect(() => {
        fetchUnseenCount();

        const socket = io('http://localhost:3000');
        socket.on('newNotification', () => {
            fetchUnseenCount();
        });

        return () => {
            socket.off('newNotification');
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ unseenCount, fetchUnseenCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => React.useContext(NotificationContext);
