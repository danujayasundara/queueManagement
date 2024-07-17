import { AppDataSource } from "../config/data-source";
import { Counter } from "../models/Counter";

const counterDao = AppDataSource.getRepository(Counter);

export const getOpenCounters = async () => {
    return counterDao.find({  where: { status: false }});
};

export const updateCounterUserIdAndStatus = async (counter: Counter, userId: number | null, status: boolean) => {
    counter.cUserId = userId;
    counter.status = status;
    return await counterDao.save(counter);
};

export const clearCounterUser = async (counterId: number) => {
    await counterDao.createQueryBuilder()
        .update(Counter)
        .set({ cUserId: 0 })
        .where("id = :counterId", { counterId })
        .execute();
};

export const getCounterByUserId = async (userId: number) => {
    return await counterDao.findOne({ where: { cUserId: userId }});
};

export const findCounterById = async (counterId: number) => {
    return await counterDao.findOne({ where: { id: counterId } });
};

export const getAvailableCounters = async () => {
    return await counterDao.find({where: { status: true, cUserId: null as any, },});
};

export const saveCounterStatus = async (counter: Counter) => {
    return await counterDao.save(counter);
};