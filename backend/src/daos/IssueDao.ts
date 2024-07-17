import { AppDataSource } from "../config/data-source";
import { Issue } from "../models/Issue";
import { Repository } from "typeorm";
import { emitNewIssue } from "..";

const issueDao = AppDataSource.getRepository(Issue);

export const createIssue = async (issueData: Partial<Issue>) => {
    const issue = issueDao.create(issueData);
    const savedIssue = await issueDao.save(issue);

    //Emit new issue event after saving
    emitNewIssue(savedIssue.counterId, savedIssue);
    return savedIssue;
}

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

export const findIssueById = async (issueId: number) => {
    return await issueDao.findOneBy({ id: issueId });
};

export const updateIssueStatus = async (issueId: number, status: boolean) => {
    return await issueDao.update(issueId, { status });
}