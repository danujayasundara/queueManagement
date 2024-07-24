import express from 'express';
import { submitIssue, getUnsolvedIssues, getIssueDetails, updateIssueStatus, reassignIssuesToMinCounter, getOngoingQueue } from '../controllers/issueController';

const router = express.Router();

router.post('/addIssue', submitIssue);
router.post('/unsolved', getUnsolvedIssues);
router.get('/:id', getIssueDetails);
router.patch('/:id/status', updateIssueStatus);
router.post('/reassign', reassignIssuesToMinCounter);   
router.post('/ongoing-queue', getOngoingQueue);

export default router;