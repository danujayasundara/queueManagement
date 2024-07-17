import express from 'express';
import { submitIssue, getUnsolvedIssues, getIssueDetails, updateIssueStatus } from '../controllers/issueController';

const router = express.Router();

router.post('/addIssue', submitIssue);
router.post('/unsolved', getUnsolvedIssues);
router.get('/:id', getIssueDetails);
router.patch('/:id/status', updateIssueStatus);

export default router;