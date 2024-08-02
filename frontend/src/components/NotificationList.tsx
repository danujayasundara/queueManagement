import React, { useEffect, useState } from 'react';
import axios from "axios";
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import './NotificationList.css';

interface NotificationListProps {
    notifications: any[];
    onNotificationClick: (notificationId: number) => void;
}


const NotificationList: React.FC<NotificationListProps> = ({ notifications, onNotificationClick }) => {

    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
    const navigate = useNavigate();

    const handleNotificationClick = (notification: any) => {
        if (!notification.status) {
            onNotificationClick(notification.id);
        }
        setSelectedNotification(notification);
    };

    const closeModal = () => {
        setSelectedNotification(null);
    };

    const goToOngoingQueue = () => {
        navigate('/ongoing-queue');
    }

    return (
        <div>
            <div className="notifheader">
                <h5>Notifications</h5>
                <button className="back-button" onClick={goToOngoingQueue}>Back to Ongoing Queue</button>
            </div>
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <div 
                        className="notification-card" 
                        key={notification.id} 
                        style={{ fontWeight: notification.status ? 'normal' : 'bold' }} 
                        onClick={() => handleNotificationClick(notification)}
                    >
                        {notification.content}
                    </div>
                ))
            ) : (
                <div>No notifications found</div>
            )}

            {selectedNotification && (
                <Modal 
                    isOpen={!!selectedNotification}
                    onRequestClose={closeModal}
                    contentLabel="Notification Detail"
                >
                    <h2>Notification Detail</h2>
                    <p>{selectedNotification.content}</p>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            )}
        </div>
    );
};

export default NotificationList;