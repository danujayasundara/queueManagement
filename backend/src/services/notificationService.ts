import { createNotification, getUnseenNotifications, updateNotificationStatus, getAllNotificationsByUserId } from "../daos/notificationDao"; 
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

export const unseenNotifications = async (userId: number) => {
    try {
        console.log(`Fetching notification with ID: ${userId}`);
        const notifiCount = await getUnseenNotifications(userId);
        console.log('Fetched notification count:', notifiCount);
        return notifiCount;
    } catch (error: any) {
        console.error(`Error fetching notification for ${userId}: ${error.message}`);
        throw new Error(`Error fetching notification for ${userId}: ${error.message}`);
    }
};

export const updateNotificationStatusService = async ( notifiId: number)=> {
    try {
        await updateNotificationStatus(notifiId);
    } catch (error) {
        console.error('Error updating notification status' ,error);
        throw new Error('Failed to update notification status');
    }
};

export const allNotificationByUserId = async (userId: number) => {
    try {
        const notifications  = await getAllNotificationsByUserId(userId);
        console.log(`All notifications of ${userId} = `, notifications);
        return { notifications };
    } catch (error) {
        console.error('Error fetching notification' ,error);
        throw new Error('Failed to fetch notification');
    }
};
