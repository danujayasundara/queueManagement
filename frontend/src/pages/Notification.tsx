import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import NotificationList from "../components/NotificationList";
import '../index.css'
import axios from "axios";
import io from 'socket.io-client';

const Notification: React.FC = () => {

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unseenCount, setUnseenCount] = useState(0);

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in sessionStorage');
            return;
        }

        const fetchUnseenCount = async () => {
            try {
                const response = await axios.post('http://localhost:3000/notification/unseen-count', { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUnseenCount(response.data.count);
            } catch (error) {
                console.error('Error fetching unseen notification count', error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const response = await axios.post('http://localhost:3000/notification/all', { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error('Error fetching notifications', error);
            }
        };
        
        fetchUnseenCount();
        fetchNotifications();

        const socket = io('http://localhost:3000');
        socket.on('newNotification', fetchNotifications);

        return () => {
            socket.off('newNotification');
        };
    }, []);

    const handleUpdateNotificationStatus = async (notificationId: number) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;

        try {
            await axios.post('http://localhost:3000/notification/update-status', { notificationId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    notif.id === notificationId ? { ...notif, status: true } : notif
                )
            );
            setUnseenCount((prevCount) => prevCount - 1);
        } catch (error) {
            console.error('Error marking notification as seen', error);
        }
    };

    return (
        <div className="container mt-2">
            <Header />
            <NavBar unseenCount={unseenCount} />
                <div className="container mt-5">
                    <div className="close mb-2">
                        <NotificationList 
                        notifications={notifications}
                        onNotificationClick={handleUpdateNotificationStatus} />
                    </div>
                </div>
             <Footer />   
        </div>
    );
};

export default Notification;