import { createIssue, countUnsolvedIssuesByCounter, getUnsolvedIssuesForCounter, findIssueById, updateIssueStatus } from "../daos/IssueDao";
import { getOpenCounters } from "../daos/CounterDao";
import { Issue } from "../models/Issue";

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

    // Update the map with actual unsolved issues count retrieved from the database
    unsolvedCounts.forEach(({ counterId, unsolvedCount }: { counterId: number, unsolvedCount: number }) => {
        if (counterUnsolvedMap.hasOwnProperty(counterId)) {
            counterUnsolvedMap[counterId] = unsolvedCount;
        }
    });

    // Find the counter with the minimum number of unsolved issues
    let minIssueCounterId = openCounters[0].id;
    let minIssueCount = counterUnsolvedMap[minIssueCounterId];

    // Iterate through the counter unsolved map to find the minimum
    for (const counterId in counterUnsolvedMap) {
        if (counterUnsolvedMap[counterId] < minIssueCount) {
            minIssueCount = counterUnsolvedMap[counterId];
            minIssueCounterId = parseInt(counterId, 10);
        }
    }

    console.log('Minimum Issue Counter ID:', minIssueCounterId);

    // Create the new issue object with the minimum issue counter ID
    const newIssue = {
        ...issueData,
        status: false,
        counterId: minIssueCounterId,
        createdAt: new Date()
    };

    // Save the new issue to the database
    return createIssue(newIssue);
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