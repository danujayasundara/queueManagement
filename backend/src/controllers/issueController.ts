import { Request, Response } from "express";
import { assignIssueToCounter, fetchUnsolvedIssuesForCounter, getIssueById, updateIssueStatusService } from "../services/IssueService";
import { fetchCounterId } from "../services/counterService"; 

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

        res.status(200).json({ issues, totalPages, counterId });
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
    const { status } = req.body;

    try {
        const issue = await updateIssueStatusService(Number(id), status);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update issue status', error });
    }
};

//export default submitIssue;