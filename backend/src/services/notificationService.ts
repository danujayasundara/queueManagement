import { createNotification } from "../daos/notificationDao"; 
import { findUserById } from "../daos/UserDao"; 
import { findIssueById } from "../daos/IssueDao"; 
import { Notification } from "../models/Notification";

export const createNotificationService = async (userId: number, issueId: number, content: string) => {
    try {
        if (!userId || !issueId || !content) {
            throw new Error('Invalid notification data');
        }
        
        const newNotifi: Partial<Notification> = {
            content,
            status: false,
            createdAt: new Date(),
            notifUserId: userId,
            issueId: issueId,
        };
        const notification = await createNotification(newNotifi);
        return notification;
    } catch (error) {
        console.error('Error in createNotificationService:', error);
        throw new Error('Failed to create notification');
    }
};