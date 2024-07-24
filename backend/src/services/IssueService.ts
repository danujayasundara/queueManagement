import { createIssue, countUnsolvedIssuesByCounter, getUnsolvedIssuesForCounter, findIssueById, updateIssueStatus, updateIssueCounter, findUnsolvedIssuesByCounterId, findUnsolvedIssueByUserId, findLastSolvedIssueByCounter, findUnsolvedIssuesByCounter } from "../daos/IssueDao";
import { getOpenCounters } from "../daos/CounterDao";
import { Issue, IssueWithIndex } from "../models/Issue";
import { Counter } from "../models/Counter";
import { emitNewIssue } from "..";
import { Server } from "socket.io";

const io = new Server();

export const assignIssueToCounter = async (issueData: Partial<Issue>) => {
    const openCounters = await getOpenCounters();
    console.log('Open Counters:', openCounters);
    if (openCounters.length === 0) {
        throw new Error("Cannot add issue. All counters are closed.");
    }
    
    const unsolvedCounts = await countUnsolvedIssuesByCounter();
    console.log('Unsolved Counts:', unsolvedCounts);

    // Create a map to store the unsolved issue counts for each counter
    const counterUnsolvedMap: { [key: number]: number } = {};

    // Initialize the map with each counter's ID and set their issue count to 0
    openCounters.forEach(counter => {
        counterUnsolvedMap[counter.id] = 0;
    });

    // Update the map with actual unsolved issues count
    unsolvedCounts.forEach(({ counterId, unsolvedCount }: { counterId: number, unsolvedCount: number }) => {
        if (counterUnsolvedMap.hasOwnProperty(counterId)) {
            counterUnsolvedMap[counterId] = unsolvedCount;
        }
    });

    let minIssueCounterId = openCounters[0].id;
    let minIssueCount = counterUnsolvedMap[minIssueCounterId];

    //find the minimum
    for (const counterId in counterUnsolvedMap) {
        if (counterUnsolvedMap[counterId] < minIssueCount) {
            minIssueCount = counterUnsolvedMap[counterId];
            minIssueCounterId = parseInt(counterId, 10);
        }
    }

    console.log('Minimum Issue Counter ID:', minIssueCounterId);

    const newIssue = {
        ...issueData,
        status: false,
        counterId: minIssueCounterId,
        createdAt: new Date()
    };

    //return createIssue(newIssue);
    const savedIssue = await createIssue(newIssue);

    // Emit new issue event
    emitNewIssue(savedIssue.counterId, savedIssue);

    return savedIssue;
};

export const fetchUnsolvedIssuesForCounter = async (counterId: number, page: number, pageSize: number) => {
    try {
        const { issues, totalIssues } = await getUnsolvedIssuesForCounter(counterId, page, pageSize);
        return { issues, totalIssues };
    } catch (error) {
        throw new Error(`Error fetching unsolved issues for counter ${counterId}:`);
    }
};

export const getIssueById = async (id: number) => {
    try {
        console.log(`Fetching issue with ID: ${id}`);
        const issue = await findIssueById(id);
        console.log('Fetched Issue:', issue);
        return issue;
    } catch (error: any) {
        console.error(`Error fetching issue for ${id}: ${error.message}`);
        throw new Error(`Error fetching issue for ${id}: ${error.message}`);
    }
};

export const updateIssueStatusService = async (id: number, status: boolean) => {
    try {
        console.log(`Updating status for issue with ID: ${id} to ${status}`);
        const updatedIssue = await updateIssueStatus(id, status);
        console.log('Updated Issue:', updatedIssue);
        return updatedIssue;
    } catch (error: any) {
        console.error(`Error updating status for issue ${id}: ${error.message}`);
        throw new Error(`Error updating status for issue ${id}: ${error.message}`);
    }
};

export const reassignIssues = async (closedCounterId: number) => {
    const issues = await findUnsolvedIssuesByCounterId(closedCounterId);
    if (issues.length === 0) {
        return { newCounterId: null };
    }
    const unsolvedCounts = await countUnsolvedIssuesByCounter();

    let openCounters: Counter[] = await getOpenCounters();
    openCounters = openCounters.filter(counter => counter.id !== closedCounterId);
    openCounters.sort((a: Counter, b: Counter) => {
        const countA = unsolvedCounts.find((c: { counterId: number; }) => c.counterId === a.id)?.unsolvedCount || 0;
        const countB = unsolvedCounts.find((c: { counterId: number; }) => c.counterId === b.id)?.unsolvedCount || 0;
        return countA - countB;
    });

    if (openCounters.length === 0) {
        throw new Error("No open counters available to reassign issues");
    }

    const targetCounterId = openCounters[0].id;

    await updateIssueCounter(closedCounterId, targetCounterId);

    //emitNewIssue(closedCounterId, issues);
    //emitNewIssue(targetCounterId, issues);
    issues.forEach(issue => {
        emitNewIssue(closedCounterId, issue);
        emitNewIssue(targetCounterId, issue);
    });

    return targetCounterId;
};

/*let initialUnsolvedIssues: Issue[] = [];

export const getOngoingQueueData = async (userId: number) => {
    const userIssue: Issue | null = await findUnsolvedIssueByUserId(userId);

    if (!userIssue) {
        return { message: `No unsolved issues found for this user ${userId}`, status: 404 };
    }

    const counterId = userIssue.counterId;

    if (initialUnsolvedIssues.length === 0) {
        initialUnsolvedIssues = await findUnsolvedIssuesByCounter(counterId);
    }

    const userIssueIndex = initialUnsolvedIssues.findIndex(issue => issue.id === userIssue.id) + 1;

    let currentIssueIndex = 1;
    let nextIssueIndex = 2;

    const lastSolvedIssue = initialUnsolvedIssues.filter(issue => issue.status === true).pop();
    if (lastSolvedIssue) {
        currentIssueIndex = initialUnsolvedIssues.findIndex(issue => issue.id === lastSolvedIssue.id) + 2;
        nextIssueIndex = currentIssueIndex + 1;
    }

    return {
        currentIssueIndex,
        nextIssueIndex,
        userIssueIndex,
        status: 200
    };
};*/
export const getOngoingQueueData = async (userId: number) => {
    try {
        // Fetch the unsolved issue for the user
        const unsolvedIssueByUser = await findUnsolvedIssueByUserId(userId);
        if (!unsolvedIssueByUser) {
            throw new Error("No unsolved issue found for the user");
        }

        const counterId = unsolvedIssueByUser.counterId;

        // Fetch all unsolved issues for the counter and assign static indices
        const initialUnsolvedIssues = await findUnsolvedIssuesByCounter(counterId);

        // Store initial issue IDs and their static indices for reference
        const staticIndices = initialUnsolvedIssues.map((issue, index) => ({
            id: issue.id,
            staticIndex: index + 1
        }));

        // Find the last solved issue
        const lastSolvedIssue = await findLastSolvedIssueByCounter(counterId);
        let currentIndex = 1;
        if (lastSolvedIssue) {
            const lastSolvedIssueIndex = staticIndices.findIndex(i => i.id === lastSolvedIssue.id);
            if (lastSolvedIssueIndex !== -1) {
                currentIndex = staticIndices[lastSolvedIssueIndex].staticIndex + 1;
            }
        }

        const nextIndex = currentIndex + 1;

        // Determine the user's issue index based on static indices
        const userIssueIndex = staticIndices.find(i => i.id === unsolvedIssueByUser.id)?.staticIndex || 1;

        return {
            initialIssues: staticIndices,
            counterId,
            currentIndex,
            nextIndex,
            myIndex: userIssueIndex
        };
    } catch (error) {
        console.error("Error fetching ongoing queue data:", error);
        throw error;
    }
};

/*export const resetInitialIssues = () => {
    initialIssues = [];
};

export const addIssueToInitialList = (newIssue: Issue) => {
    const newIndex = initialIssues.length + 1;
    initialIssues.push({ ...newIssue, index: newIndex });
};*/

/*export const markIssueAsSolved = async (issueId: number) => {
    // Mark the issue as solved in your database
    const issue = await AppDataSource.getRepository(Issue).findOneBy({ id: issueId });
    if (issue) {
        issue.status = true;
        await AppDataSource.getRepository(Issue).save(issue);
        lastSolvedIssueId = issueId; // Update the last solved issue ID
    }
};*/