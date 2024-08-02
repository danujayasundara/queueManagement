import { Issue } from "../models/Issue";

// Store for static indices
type StaticIndexStore = {
    [counterId: string]: {
        [issueId: number]: number;
    };
};

const staticIndexStore: StaticIndexStore = {};

// Store for unsolved issues
type UnsolvedIssuesStore = {
    [counterId: string]: Issue[];
};

const unsolvedIssuesStore: UnsolvedIssuesStore = {};

// Get static index for a specific issue
export const getStaticIndex = (counterId: string, issueId: number): number | undefined => {
    return staticIndexStore[counterId]?.[issueId];
};

// Set static index for a specific issue
export const setStaticIndex = (counterId: string, issueId: number, index: number) => {
    if (!staticIndexStore[counterId]) {
        staticIndexStore[counterId] = {};
    }
    staticIndexStore[counterId][issueId] = index;
};

// Reset static indices for a specific counter
export const resetStaticIndices = (counterId: string) => {
    staticIndexStore[counterId] = {};
};

// Get all static indices for a specific counter
export const getStaticIndicesForCounter = (counterId: string) => {
    return staticIndexStore[counterId] || {};
};

// Assign static indices to issues during the initial fetch
export const assignStaticIndicesOnFetch = (issues: Issue[], counterId: string) => {
    issues.forEach((issue, index) => {
        setStaticIndex(counterId, issue.id, index + 1);
    });
};

// Set unsolved issues for a specific counter
export const setUnsolvedIssues = (counterId: string, issues: Issue[]) => {
    unsolvedIssuesStore[counterId] = issues;
};

// Get unsolved issues for a specific counter
export const getUnsolvedIssues = (counterId: string): Issue[] => {
    return unsolvedIssuesStore[counterId] || [];
};

// Reset unsolved issues for a specific counter
export const resetUnsolvedIssues = (counterId: string) => {
    unsolvedIssuesStore[counterId] = [];
};

// Update the in-memory store and assign static indices to new issues
export const updateUnsolvedIssues = (counterId: string, newIssues: Issue[]) => {
    const existingIssues = getUnsolvedIssues(counterId);

    // Calculate the highest index of existing issues
    const existingIndices = Object.values(getStaticIndicesForCounter(counterId));
    const highestIndex = existingIndices.length > 0 ? Math.max(...existingIndices) : 0;

    // Assign new indices to newly added issues starting from highestIndex + 1
    newIssues.forEach((issue, index) => {
        if (!getStaticIndex(counterId, issue.id)) {
            // Only assign index if it does not already have one
            setStaticIndex(counterId, issue.id, highestIndex + index + 1);
        }
    });

    // Update the store with all issues, including the new ones
    const updatedIssues = [...existingIssues, ...newIssues];
    setUnsolvedIssues(counterId, updatedIssues);
};
