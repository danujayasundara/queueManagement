import { AppDataSource } from "../config/data-source";
import { Issue } from "../models/Issue";
import { Repository } from "typeorm";
import { emitNewIssue } from "..";

const issueDao = AppDataSource.getRepository(Issue);

export const createIssue = async (issueData: Partial<Issue>) => {
    const issue = issueDao.create({...issueData, solvedAt: null});
    const savedIssue = await issueDao.save(issue);

    //Emit new issue event after saving
    //emitNewIssue(savedIssue.counterId, savedIssue);
    console.log("cretated new issue = ", savedIssue);
    return savedIssue;
};

export const countUnsolvedIssuesByCounter = async () => {
    const query = `SELECT counterId, count(*) as unsolvedCount FROM issue WHERE status = 0 GROUP BY counterId`;

    const result = await issueDao.query(query);
    const formattedResult = result.map((row: any) => ({
        counterId: row.counterId,
        unsolvedCount: parseInt(row.unsolvedCount, 10), // Parse as number
    }));

    return formattedResult;
};

export const getUnsolvedIssuesForCounter = async (counterId: number, page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;

    const [issues, totalIssues] = await Promise.all([
        issueDao.find({
            where: { counterId, status: false },
            order: { createdAt: 'ASC' },
            skip,
            take: pageSize,
        }),
        issueDao.count({ where: { counterId, status: false } })
    ]);

    return { issues, totalIssues };
};

export const findUnsolvedIssuesByCounterId = async (counterId: number) => {
    const [issues ] = await Promise.all([
        issueDao.find({
            where: { counterId, status: false },
            order: { createdAt: 'ASC' },
        }),
    ]);

    return [ issues ];
};

export const findIssueById = async (issueId: number) => {
    return await issueDao.findOneBy({ id: issueId });
};

/*export const updateIssueStatus = async (issueId: number, status: boolean) => {
    return await issueDao.update(issueId, { status });
};*/
export const updateIssueStatus = async (issueId: number, status: boolean) => {
    //const issueRepository = getRepository(Issue);
    const updateFields: Partial<Issue> = { status };
    if (status) {
        updateFields.solvedAt = new Date(); // Set solvedAt to the current datetime
    }
    return await issueDao.update(issueId, updateFields);
};


export const updateIssueCounter = async (oldCounterId: number, newCounterId: number): Promise<void> => {
    await issueDao
        .createQueryBuilder()
        .update(Issue)
        .set({ counterId: newCounterId })
        .where("counterId = :oldCounterId", { oldCounterId })
        .execute();
};

export const findUnsolvedIssueByUserId = async (userId: number): Promise<Issue | null> => {
    return await AppDataSource.getRepository(Issue).findOne({
        where: { userId, status: false },
        order: { createdAt: 'ASC' },
    });
};

export const findUnsolvedIssuesByCounter = async (counterId: number): Promise<Issue[]> => {
    const unsolvedIssues = await AppDataSource.getRepository(Issue).find({
        where: { counterId, status: false },
        order: { createdAt: 'ASC' }
    });

    // Assign static indices to unsolved issues
    return unsolvedIssues.map((issue, index) => ({
        ...issue,
        staticIndex: index + 1
    }));
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
