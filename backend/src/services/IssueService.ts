import { createIssue, countUnsolvedIssuesByCounter, findIssueById, updateIssueStatus, updateIssueCounter, findUnsolvedIssuesByCounterId, findUnsolvedIssueByUserId, findLastSolvedIssueByCounter, findUnsolvedIssuesByCounter, getAllUnsolvedIssuesForCounter, getIssueAndCounter, findCounterIdByIssueId, findAnIssueById } from "../daos/IssueDao";
import { getOpenCounters } from "../daos/CounterDao";
import { getIssueIndex, issueIndexMap } from "../utils/indexUtils";
import { getStaticIndex, setStaticIndex, resetStaticIndices, getStaticIndicesForCounter, setUnsolvedIssues, assignStaticIndicesOnFetch, updateUnsolvedIssues } from "../utils/staticIndexStore";
import { Issue, IssueWithIndex } from "../models/Issue";
import { Counter } from "../models/Counter";
import { emitMyIssueIndexUpdate, emitNewIssue } from "..";
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

    const allUnsolvedIssues = await findUnsolvedIssuesByCounterId(minIssueCounterId);
    updateUnsolvedIssues(minIssueCounterId.toString(), [savedIssue]);

    // Emit new issue event
    emitNewIssue(savedIssue.counterId, savedIssue);

    return savedIssue;
};

export const fetchAndAssignStaticIndices = async (counterId: string) => {
    const allUnsolvedIssues = await findUnsolvedIssuesByCounterId(parseInt(counterId, 10));
    
    // Update the in-memory store and assign static indices
    setUnsolvedIssues(counterId, allUnsolvedIssues.flat());
    assignStaticIndicesOnFetch(allUnsolvedIssues.flat(), counterId);

    return allUnsolvedIssues;
};

export const fetchUnsolvedIssuesForCounter = async (counterId: string, page: number, pageSize: number) => {
    try {
        const allIssues = await getAllUnsolvedIssuesForCounter(Number(counterId));

        // Assign static indices and update the map
        const issuesWithIndices = allIssues.map((issue, index) => {
            const staticIndex = getStaticIndex((counterId), (issue.id)) ?? 0;
            issueIndexMap.set(String(issue.id), staticIndex);
            return {
                ...issue,
                staticIndex
            };
        });

        // Sort issues by staticIndex
        issuesWithIndices.sort((a, b) => (a.staticIndex ?? 0) - (b.staticIndex ?? 0));

        const totalIssues = issuesWithIndices.length;
        const totalPages = Math.ceil(totalIssues / pageSize);

        const startIndex = (page - 1) * pageSize;
        const paginatedIssues = issuesWithIndices.slice(startIndex, startIndex + pageSize);

        return { issues: paginatedIssues, totalIssues, totalPages };
    } catch (error: any) {
        throw new Error(`Error fetching unsolved issues for counter ${counterId}: ${error.message}`);
    }
};

export const resetIndicesForCounter = (counterId: string) => {
    resetStaticIndices(counterId);
};

export const fetchAllUnsolvedIssuesForCounter = async (counterId: number) => {
    try {
        const  issues  = await findUnsolvedIssuesByCounterId(counterId);
        return  issues ;
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
    const issues = await getAllUnsolvedIssuesForCounter(closedCounterId);
    if (issues.length === 0) {
        return { newCounterId: [] };
    }
    const unsolvedCounts = await countUnsolvedIssuesByCounter();

    let openCounters: Counter[] = await getOpenCounters();
    openCounters = openCounters.filter(counter => counter.id !== closedCounterId);
    
    if (openCounters.length === 0) {
        throw new Error("No open counters available to reassign issues");
    }
    
    openCounters.sort((a: Counter, b: Counter) => {
        const countA = unsolvedCounts.find((c: { counterId: number; }) => c.counterId === a.id)?.unsolvedCount || 0;
        const countB = unsolvedCounts.find((c: { counterId: number; }) => c.counterId === b.id)?.unsolvedCount || 0;
        return countA - countB;
    });

    const counterIssueMap: Record<number, Issue[]> = openCounters.reduce((acc, counter) => {
        acc[counter.id] = [];
        return acc;
    }, {} as Record<number, Issue[]>);

    // Distribute issues in a round-robin fashion
    let issueIndex = 0;
    while (issueIndex < issues.length) {
        for (const counter of openCounters) {
            if (issueIndex < issues.length) {
                const issue = issues[issueIndex];
                await updateIssueCounter(issue.id, counter.id);
                counterIssueMap[counter.id].push(issue);
                issueIndex++;
            } else {
                break;
            }
        }
    }
    
    // Assign static indices to the newly assigned issues for each counter
    for (const [counterId, issues] of Object.entries(counterIssueMap)) {
        updateUnsolvedIssues(counterId.toString(), issues);
    }

    // Emit event for each user associated with an issue
    for (const issue of issues) {
        const userId = issue.userId; 
        const { issueIndex } = await getIssueIndex(String(userId)); 
        if (issueIndex !== null) {
            emitMyIssueIndexUpdate(userId, issueIndex);
            console.log("Event emitted for user:", userId, "with issueIndex:", issueIndex);
        }
    }

    issues.forEach(issue => {
        emitNewIssue(closedCounterId, issue);
        openCounters.forEach(counter => emitNewIssue(counter.id, issue));
    });

    return openCounters.map(counter => counter.id);
};


export const getQueueCounterId = async (userId: number) => {
    try {
        const unsolvedIssueByUser = await findUnsolvedIssueByUserId(userId);
        if (!unsolvedIssueByUser) {
            throw new Error("No unsolved issue found for the user");
        }

        const counterId = unsolvedIssueByUser.counterId;
        const issueId = unsolvedIssueByUser.id;
        console.log("Counter id is ****", counterId);
        return { counterId, issueId  };

    } catch (error) {
        console.error("Error fetching ongoing queue counterId:", error);
        throw error;
    }
};

export const currentAndNextIndices = async (issueId: number, issueIndex: number) => {
    try {
        const issue = await findIssueById(issueId);
        if(!issue) {
            throw new Error('Issue not found');
        }

        const currentIndex = issueIndex;
        const nextIndex = currentIndex + 1;

        return { currentIndex, nextIndex };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getUserIssueAndCounter = async(userId: number) => {
    try {
        const issue = await getIssueAndCounter(userId);
        if(!issue) {
            throw new Error('Issue not found');
        }

        const counterId = issue.counterId;
        const issueId = issue.id;

        return { counterId, issueId };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getCounterIdByIssueId  = async(issueId: number) => {
    try {
        const counterId  = await findCounterIdByIssueId(issueId);
        return counterId;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const checkIfUserHasUnsolvedIssue = async (userId: number): Promise<boolean> => {
    const issue = await findUnsolvedIssueByUserId(userId);
    return issue !== null;
};

export const getIssueStatus = async (issueId: number): Promise<boolean | null> => {
    try {
        const issue = await findAnIssueById(issueId);
        if (issue) {
            return issue.status;
        } else {
            throw new Error('Issue not found');
        }
    } catch (error) {
        console.error("Error in getIssueStatus service:", error);
        throw error;
    }
};


