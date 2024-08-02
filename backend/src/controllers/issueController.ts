import { Request, Response } from "express";
import { assignIssueToCounter, fetchUnsolvedIssuesForCounter, getIssueById, updateIssueStatusService, reassignIssues, getQueueCounterId, fetchAllUnsolvedIssuesForCounter, resetIndicesForCounter, currentAndNextIndices, getCounterIdByIssueId, checkIfUserHasUnsolvedIssue, getIssueStatus } from "../services/IssueService";
import axios from 'axios';
import { fetchCounterId } from "../services/counterService"; 
import { findCounterById } from "../daos/CounterDao";
import { Issue } from "../models/Issue";
import { getIssueIndex } from "../utils/indexUtils";
import { emitMyIssueIndexUpdate, io } from "..";

export const submitIssue = async (req: Request, res: Response) => {
    const { name, telephoneNo, email, issueDescription, userId } = req.body;

    try {
        if (!userId || !userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const newIssue = await assignIssueToCounter({
            name,
            telephoneNo,
            email,
            issueDescription,
            userId: parseInt(userId, 10),
        });

        res.status(201).json(newIssue);
    } catch (error: any) {
        console.error('Error submitting issue', error);
        if (error.message === 'Cannot add issue. All counters are closed.') {
            return res.status(400).json({ error: 'Cannot add issue. All counters are closed.' });
        }
        res.status(500).json({ error: 'Failed to submit issue' });
    }
};

export const getUnsolvedIssues = async (req: Request, res: Response) => {
    const { counterId, page, pageSize } = req.body;

    try {
        if (!counterId) {
            return res.status(404).json({ message: 'Counter not found for the user' });
        }

        const { issues, totalIssues, totalPages } = await fetchUnsolvedIssuesForCounter(counterId, parseInt(page, 10), parseInt(pageSize, 10));

        res.status(200).json({ issues, totalPages, totalUnsolvedCount: totalIssues, counterId });
    } catch (error) {
        console.error('Error fetching unsolved issues', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetIndices = async (req: Request, res: Response) => {
    const { counterId } = req.body;

    try {
        if (!counterId) {
            return res.status(404).json({ message: 'Counter not found' });
        }

        resetIndicesForCounter(counterId);
        res.status(200).json({ message: 'Static indices reset successfully' });
    } catch (error) {
        console.error('Error resetting static indices', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllUnsolvedIssues = async (req: Request, res: Response) => {
    const { counterId } = req.body;

    try {
        if (!counterId) {
            return res.status(404).json({ message: 'Counter not found for the user' });
        }

        // Fetch current and next issue indices
        const indicesResponse = await axios.post('http://localhost:3000/issue/get-indices', { counterId });
        const indices = indicesResponse.data;

        const  issues  = await fetchAllUnsolvedIssuesForCounter(counterId);

        res.status(200).json({ issues, counterId, indices });
    } catch (error) {
        console.error('Error fetching unsolved issues', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getIssueDetails = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const issueId = parseInt(id, 10);
        console.log('Requested Issue ID:', issueId);
        const issue = await getIssueById(issueId);

        if (!issue) {
            console.log(`Issue ${id} not found`);
            return res.status(404).json({ message: `Issue ${id} not found`});
        }
        console.log('Returning Issue:', issue); 
        res.status(200).json(issue);
    } catch (error) {
        console.error('Error fetching issue details', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, counterId } = req.body;

    try {
        const issue = await updateIssueStatusService(Number(id), status);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        io.emit('issueSolved', { id: Number(id), counterId });

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update issue status', error });
    }
};

export const reassignIssuesToMinCounter = async (req: Request, res: Response) => {
    const { counterId } = req.body;
    try {
        const newCounterId = await reassignIssues(counterId);
        res.status(200).json({ message: 'Issues reassigned', newCounterId });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to reassign issues', error: error.message });
    }
};

export const ongoingQueueCounter = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        const result = await getQueueCounterId(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching ongoing queue data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCurrentAndNextIndex = async (req: Request, res: Response) => {
    const { issueId, issueIndex } = req.body;

    try {
        const { currentIndex, nextIndex } = await currentAndNextIndices(issueId, issueIndex);

        req.app.get('io').emit('updateIndices', { currentIndex, nextIndex });
        res.status(200).json({ currentIndex, nextIndex });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update indices', error: error.message });
    }
};

//get index of an issue
export const getUserIssueIndexHandler = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    console.log(`Received userId for MY NO: ${userId}`);
    if (!(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const { issueIndex, issueId } = await getIssueIndex(String(userId));
        if (issueIndex !== null && issueId !== null) {
            const counterId = await getCounterIdByIssueId(issueId);
            console.log('Issue Index:', issueIndex, 'Issue ID:', issueId, 'Counter ID:', counterId);
            res.status(200).json({ issueIndex, issueId, counterId });
        } else {
            res.status(404).json({ message: 'Issue not found for user' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch issue index', error: error.message });
    }
};

export const checkExistingIssue = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);

    if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const hasIssue = await checkIfUserHasUnsolvedIssue(userId);
        res.json({ hasIssue });
    } catch (error) {
        console.error('Error checking existing issue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getIssueStatusHandler = async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId, 10);
    if (!issueId) {
        return res.status(400).json({ error: 'Invalid issue ID' });
    }

    try {
        const status = await getIssueStatus(issueId);
        res.status(200).json({ status });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch issue status', error: error.message });
    }
};