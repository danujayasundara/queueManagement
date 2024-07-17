import express from 'express';
import { createNotificationHandler } from '../controllers/notificationController';

const router = express.Router();

router.post('/add', createNotificationHandler);

export default router;