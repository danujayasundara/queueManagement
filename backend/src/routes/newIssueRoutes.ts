import express from 'express';
import { submitIssue, getIssueDetails, updateIssueStatus, reassignIssuesToMinCounter, ongoingQueueCounter, getAllUnsolvedIssues, getUnsolvedIssues, updateCurrentAndNextIndex, getUserIssueIndexHandler, checkExistingIssue, getIssueStatusHandler } from '../controllers/issueController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/addIssue', authMiddleware, submitIssue);
router.post('/unsolved', authMiddleware, getUnsolvedIssues);
router.get('/:id', authMiddleware, getIssueDetails);
router.put('/:id/status', authMiddleware, updateIssueStatus);
router.post('/reassign', authMiddleware, reassignIssuesToMinCounter); 
router.post('/ongoing-queue-counter', authMiddleware, ongoingQueueCounter);
router.post('/all', authMiddleware, getAllUnsolvedIssues); 
router.post('/update-indices', authMiddleware, updateCurrentAndNextIndex); 
router.get('/issueIndex/:userId', authMiddleware, getUserIssueIndexHandler); 
router.get('/check/:userId', authMiddleware, checkExistingIssue);
router.get('/status/:issueId', authMiddleware, getIssueStatusHandler);

export default router;