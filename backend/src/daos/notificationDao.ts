import { AppDataSource } from "../config/data-source";
import { Notification } from "../models/Notification";

const notifiDao = AppDataSource.getRepository(Notification);

export const createNotification = async (notificationData: Partial<Notification>) => {
    const notifi = notifiDao.create(notificationData);
    const savedNotifi = await notifiDao.save(notifi);

    return savedNotifi;
};
//Emit new notification event after saving
    //emitNewNotifi(savedNotifi.counterId, savedNotifi);