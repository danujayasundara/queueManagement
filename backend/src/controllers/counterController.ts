import { Request, Response } from "express";
import { fetchCounterName, toggleCounterStatusService, getCounterStatusService } from "../services/counterService";

export const getCounterName = async (req: Request, res: Response) => {
    const { counterId  } = req.body;

    try {
        const counterName = await fetchCounterName(counterId);
        if(counterName) {
            res.status(200).json({ counterName });
        } else {
            res.status(404).json({ message: 'Counter not found'});
        }
    } catch (error) {
        console.error('Error fetching counter name', error);
        res.status(500).json({ message: 'Server error'});
    }
};

export const toggleCounterStatus = async (req: Request, res: Response) => {
    const { counterId } = req.body;
    try {
        const message = await toggleCounterStatusService(counterId);
        res.json({ message });
    } catch (error: any) {
        if (error.message === 'Counter not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Failed to update counter status', error });
        }
    }
};

export const getCounterStatus = async (req: Request, res: Response) => {
    const { counterId } = req.params;
    try {
        const status = await getCounterStatusService(Number(counterId));
        res.json({ status });
    } catch (error: any) {
        if (error.message === 'Counter not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Failed to fetch counter status', error });
        }
    }
};