interface Issue {
    id: number;
    staticIndex: number;
}

const sessionStore: { [counterId: string]: Issue[] } = {};

export const addIssuesToCounter = (counterId: string, issues: Issue[]) => {
    sessionStore[counterId] = issues;
};

export const getIssuesFromCounter = (counterId: string): Issue[] | null => {
    return sessionStore[counterId] || null;
};