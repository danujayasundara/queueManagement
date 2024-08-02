import { Request, Response } from "express";
import { createNotificationService, unseenNotifications, updateNotificationStatusService, allNotificationByUserId } from "../services/notificationService"; 
import { io } from '../index';

export const createNotificationHandler = async (req: Request, res: Response) => {
    try {
        const { notfiUserId , issueId, content } = req.body;
        const notification = await createNotificationService(notfiUserId, issueId, content);
        res.status(201).json(notification);
    } catch (error: any) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

export const fetchUnseenNotifi = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const unseenCount = await unseenNotifications(userId);
        res.status(200).json({ count: unseenCount });
    } catch (error: any) {
        console.error('Error fetching unseen notification count', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateNotifiStatus = async (req: Request, res: Response) => {
    try {
        const { notificationId, userId } = req.body;
        await updateNotificationStatusService(notificationId);
        const unseenCount = await unseenNotifications(userId);
        io.emit('notificationStatusUpdated', { userId, notificationId, unseenCount });
        res.status(200).json({ count: unseenCount });
    } catch (error: any) {
        console.error('Error updating notification status', error.message );
        res.status(500).json({ error: 'Server error' });
    }
};

export const getAllByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const { notifications } = await allNotificationByUserId(userId);
        res.status(200).json({ notifications });
    } catch (error: any) {
        console.error('Error getting notification', error.message );
        res.status(500).json({ error: 'Server error' });
    }
};