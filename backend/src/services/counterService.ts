import { io } from "..";
import { getCounterByUserId, findCounterById, saveCounterStatus, updateCounterUserIdAndStatus, getAvailableCounters   } from "../daos/CounterDao";
import { Counter } from "../models/Counter";

export const fetchCounterName = async (counterId: number) => {
    const counter = await findCounterById(counterId);
    return counter ? counter.cName : null;
}

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
        // Counter closed, status is 1
        io.emit('counterClose', { counterId });
        return 'Counter closed successfully';
    } else {
        // Counter opened, status is 0
        io.emit('counterOpen', { counterId });
        return 'Counter opened successfully';
    }
    //return counter.status ? 'Counter closed successfully' : 'Counter opened successfully';
};

export const getCounterStatusService = async (counterId: number) => {
    const counter = await findCounterById(counterId);
    if (!isCounter(counter)) {
        throw new Error('Counter not found');
    }
    return counter.status;
};
