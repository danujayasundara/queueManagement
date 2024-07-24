import { Request, Response } from "express";
import { assignIssueToCounter, fetchUnsolvedIssuesForCounter, getIssueById, updateIssueStatusService, reassignIssues, getOngoingQueueData } from "../services/IssueService";
import { fetchCounterId } from "../services/counterService"; 
import { findCounterById } from "../daos/CounterDao";

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

        const { issues, totalIssues } = await fetchUnsolvedIssuesForCounter(counterId, parseInt(page, 10), parseInt(pageSize, 10));
        const totalPages = Math.ceil(totalIssues / pageSize);

        res.status(200).json({ issues, totalPages, totalUnsolvedCount: totalIssues, counterId });
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
        //resetInitialIssues();
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Check if counter is closed
        //const counterId = issue.counterId;
        /*const counter = await findCounterById(counterId);
        if (counter && counter.status === true) {
            resetInitialIssues();
        }*/

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

/*export const getOngoingQueue = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        const result = await getOngoingQueueData(userId);

        if (result.status === 404) {
            return res.status(404).json({ message: result.message });
        }

        res.json({
            currentIssueIndex: result.currentIssueIndex,
            nextIssueIndex: result.nextIssueIndex,
            userIssueIndex: result.userIssueIndex,
        });
    } catch (error) {
        console.error('Error fetching ongoing queue data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};*/

export const getOngoingQueue = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        const result = await getOngoingQueueData(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching ongoing queue data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//export default submitIssue;