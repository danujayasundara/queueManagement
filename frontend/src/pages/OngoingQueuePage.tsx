import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import OngoingQueue from "../components/OngoingQueue";
import './Home.css';
import { io } from "socket.io-client";
import axios from "axios";

const OngoingQueuePage: React.FC = () => {
    const [unseenCount, setUnseenCount] = useState(0);
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in sessionStorage');
            return;
        }

        const fetchNotifications = async () => {
            try {
                const response = await axios.post('http://localhost:3000/notification/all', { userId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUnseenCount(response.data.notifications.filter((notif: any) => !notif.status).length);
            } catch (error) {
                console.error('Error fetching notifications', error);
            }
        };

        fetchNotifications();

        const socket = io('http://localhost:3000');
        socket.on('newNotification', fetchNotifications);

        return () => {
            socket.off('newNotification');
        };
    }, []);

    return (
        <div className="container mt-2">
            <Header />
            <NavBar unseenCount={unseenCount} />
                <div>
                    <h5 style={{ fontSize: '30px' }}>Ongoing Queue</h5>
                    <div>
                        <OngoingQueue />
                    </div>
                </div>
             <Footer />   
        </div>
    );
};

export default OngoingQueuePage;