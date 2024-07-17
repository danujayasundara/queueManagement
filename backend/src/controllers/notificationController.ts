import { Request, Response } from "express";
import { createNotificationService } from "../services/notificationService"; 

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