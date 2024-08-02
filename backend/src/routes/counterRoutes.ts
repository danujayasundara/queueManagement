import express from 'express';
import { getCounterName, toggleCounterStatus, getCounterStatus, getOpenCounters } from '../controllers/counterController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/counterName', authMiddleware, getCounterName);
router.get('/open', authMiddleware, getOpenCounters);
router.post('/toggle-status', authMiddleware, toggleCounterStatus);
router.get('/status/:counterId', authMiddleware, getCounterStatus);

export default router;