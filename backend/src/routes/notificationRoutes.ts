import express from 'express';
import { createNotificationHandler, fetchUnseenNotifi, updateNotifiStatus, getAllByUserId } from '../controllers/notificationController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/add', authMiddleware, createNotificationHandler); 
router.post('/unseen-count', authMiddleware, fetchUnseenNotifi);
router.post('/update-status', authMiddleware, updateNotifiStatus);
router.post('/all', authMiddleware, getAllByUserId);

export default router;