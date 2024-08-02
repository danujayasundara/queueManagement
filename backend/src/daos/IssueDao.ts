import { AppDataSource } from "../config/data-source";
import { Issue } from "../models/Issue";

const issueDao = AppDataSource.getRepository(Issue);

export const createIssue = async (issueData: Partial<Issue>) => {
    const issue = issueDao.create({...issueData, solvedAt: null});
    const savedIssue = await issueDao.save(issue);
    console.log("cretated new issue = ", savedIssue);
    return savedIssue;
};

export const countUnsolvedIssuesByCounter = async () => {
    const query = `SELECT counterId, count(*) as unsolvedCount FROM issue WHERE status = 0 GROUP BY counterId`;

    const result = await issueDao.query(query);
    const formattedResult = result.map((row: any) => ({
        counterId: row.counterId,
        unsolvedCount: parseInt(row.unsolvedCount, 10), 
    }));

    return formattedResult;
};

//fetch all issues
export const getAllUnsolvedIssuesForCounter = async (counterId: number) => {
    const issues = await issueDao.find({
        where: { counterId, status: false },
    });
    return issues;
};

export const findUnsolvedIssuesByCounterId = async (counterId: number) => {
    const [ issues ]  = await Promise.all([
        issueDao.find({
            where: { counterId, status: false },
        }),
    ]);

    return  [ issues ];
};

export const findIssueById = async (issueId: number) => {
    return await issueDao.findOneBy({ id: issueId });
};

export const updateIssueStatus = async (issueId: number, status: boolean) => {
    const updateFields: Partial<Issue> = { status };
    if (status) {
        updateFields.solvedAt = new Date(); 
    }
    return await issueDao.update(issueId, updateFields);
};


export const updateIssueCounter = async (issueId: number, newCounterId: number): Promise<void> => {
    await issueDao
        .createQueryBuilder()
        .update(Issue)
        .set({ counterId: newCounterId })
        .where("id = :issueId", { issueId })
        .execute();
};

export const findUnsolvedIssueByUserId = async (userId: number): Promise<Issue | null> => {
    return await AppDataSource.getRepository(Issue).findOne({
        where: { userId, status: false },
    });
};

export const findUnsolvedIssuesByCounter = async (counterId: number): Promise<Issue[]> => {
    const unsolvedIssues = await AppDataSource.getRepository(Issue).find({
        where: { counterId, status: false },
        
    });
    return unsolvedIssues;
};

export const getIssueAndCounter = async (userId: number) => {
    const userIssue = await issueDao.findOne({ where: { userId, status: false }});
    return userIssue;
};

export const findCounterIdByIssueId = async (issueId: number) => {
    const issue  = await issueDao.findOne({ where: { id: issueId }, relations: ['counter'] });
    return issue?.counter?.id ?? null;
};


// Find the last solved issue
export const findLastSolvedIssueByCounter = async (counterId: number): Promise<Issue | null> => {
    const lastSolvedIssues = await AppDataSource.getRepository(Issue).find({
        where: { counterId, status: true },
        order: { solvedAt: 'DESC' },
        take: 1
    });
    return lastSolvedIssues.length > 0 ? lastSolvedIssues[0] : null;
};

export const findAnIssueById = async (issueId: number): Promise<Issue | null> => {
    try {
        const issue = await issueDao.findOne({ where: { id: issueId } });
        return issue;
    } catch (error) {
        console.error("Error fetching issue:", error);
        throw error;
    }
};

export const getUsersOfCounter = async (counterId: number): Promise<number[]> => {
    try {
        const issues = await issueDao.find({ 
            where: { counterId, status: false } 
        });
        return issues.map(issue => issue.userId);
    } catch (error) {
        console.error('Error fetching users of counter:', error);
        return [];
    }
};
