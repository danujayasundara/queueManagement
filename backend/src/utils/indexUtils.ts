import { io } from "..";
import { findUnsolvedIssueByUserId } from "../daos/IssueDao";

export const issueIndexMap = new Map<string, number>();

export const getIssueIndex = async (userId: string): Promise<{ issueIndex: number | null; issueId: number | null }> => {
    console.log(`Fetching issue index for userId: ${userId}`);
    
    const userIssue = await findUnsolvedIssueByUserId(Number(userId));
    const issueId = userIssue?.id;

    if (issueId) {
        const index = issueIndexMap.get(String(issueId));
        io.to(String(userId)).emit('updateMyIssueIndex', { index });
        console.log(`Issue ID: ${issueId}, Index**: ${index}`);
        return { issueIndex: index ?? null, issueId };
    }

    console.log('No issue found for user');
    return { issueIndex: null, issueId: null };
};