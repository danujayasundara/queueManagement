import { io } from "..";
import { getCounterByUserId, findCounterById, saveCounterStatus, updateCounterUserIdAndStatus, getAvailableCounters, getOpenCounters   } from "../daos/CounterDao";
import { Counter } from "../models/Counter";
import { resetStaticIndices, resetUnsolvedIssues, setUnsolvedIssues } from "../utils/staticIndexStore";

export const fetchCounterName = async (counterId: number) => {
    const counter = await findCounterById(counterId);
    return counter ? counter.cName : null;
};

export const getOpenCountersCount = async (): Promise<number> => {
    try {
        const openCounters = await getOpenCounters();
        console.log("All open counters:", openCounters);
        
        const totalOpenCounters = openCounters.length;
        const adjustedCount = totalOpenCounters - 1;  // Subtract one from the total count

        return adjustedCount;
    } catch (error) {
        console.error("Error fetching open counters:", error);
        throw new Error('Failed to fetch open counters');
    }
};

export const fetchCounterId = async (userId: number) => {
    const counter = await getCounterByUserId(userId);
    return counter ? counter.id : null;
};

function isCounter(counter: Counter | null): counter is Counter {
    return counter !== null;
}

export const toggleCounterStatusService = async (counterId: number) => {
    const counter = await findCounterById(counterId);
    if (!isCounter(counter)) {
        throw new Error('Counter not found');
    }
    counter.status = !counter.status;
    await saveCounterStatus(counter);
    if (counter.status) {
        resetStaticIndices(counter.id.toString());
        resetUnsolvedIssues(counter.id.toString());
        io.emit('counterClose', { counterId });
        return 'Counter closed successfully';
    } else {
        io.emit('counterOpen', { counterId });
        return 'Counter opened successfully';
    }
};

export const getCounterStatusService = async (counterId: number) => {
    const counter = await findCounterById(counterId);
    if (!isCounter(counter)) {
        throw new Error('Counter not found');
    }
    return counter.status;
};
