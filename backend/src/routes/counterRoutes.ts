import express from 'express';
import { getCounterName, toggleCounterStatus, getCounterStatus } from '../controllers/counterController';

const router = express.Router();

router.post('/counterName', getCounterName);
router.post('/toggle-status', toggleCounterStatus);
router.get('/status/:counterId', getCounterStatus);

export default router;