import { notifyNewNotification } from "..";
import { AppDataSource } from "../config/data-source";
import { Notification } from "../models/Notification";

const notifiDao = AppDataSource.getRepository(Notification);

export const createNotification = async (notificationData: Partial<Notification>) => {
    const notifi = notifiDao.create(notificationData);
    const savedNotifi = await notifiDao.save(notifi);
    notifyNewNotification();
    return savedNotifi;
};

export const getUnseenNotifications = async (userId: number) => {
    const unseenNotifi = notifiDao.count({ where: { notifUserId: userId, status: false }});
    return unseenNotifi;
};

export const updateNotificationStatus = async (notifiId: number) => {
    await notifiDao.update({ id: notifiId }, { status: true });
    notifyNewNotification();
};

export const getAllNotificationsByUserId = async(userId: number) => {
    const all  = await notifiDao.find({ where: { notifUserId: userId }, order: { createdAt: 'DESC' }});
    return all;
};
