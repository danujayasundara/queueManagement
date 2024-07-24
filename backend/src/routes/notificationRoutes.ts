import express from 'express';
import { createNotificationHandler, fetchUnseenNotifi, updateNotifiStatus, getAllByUserId } from '../controllers/notificationController';

const router = express.Router();

router.post('/add', createNotificationHandler); 
router.post('/unseen-count', fetchUnseenNotifi);
router.post('/update-status', updateNotifiStatus);
router.post('/all', getAllByUserId);

export default router;