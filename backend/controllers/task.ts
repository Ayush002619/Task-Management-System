import { Response, Request } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth";

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({
                message: "Title is required",
            });
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId: req.userId!,
            },
        });
        return res.status(201).json({
            message: "Task created",
            task,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { page = "1", limit = "5", status, search } = req.query;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;
        const where: any = {
            userId: req.userId
        };
        if (status) {
            where.status = status as string;
        }
        if (search) {
            where.title = {
                contains: search as string,
                mode: "insensitive", // better search
            };
        }
        const tasks = await prisma.task.findMany({
            where,
            skip,
            take: limitNumber,
            orderBy: { createdAt: "desc" },
        });
        const totalTasks = await prisma.task.count({ where });
        return res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limitNumber),
            tasks,
        });
    } catch (error: any) {
        console.error("Get tasks error:", error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.id);
        if (isNaN(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const { title, description, status } = req.body;
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(status !== undefined && { status }),
            },
        });
        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error: any) {
        console.error("Update error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const taskId = parseInt(req.params.id as string);
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: req.userId,
            },
        });
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        await prisma.task.delete({
            where: { id: taskId },
        });
        return res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


export const toggleTaskStatus = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.id);
        if (isNaN(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const newStatus =
            task.status === "pending" ? "completed" : "pending";
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        });
        return res.status(200).json({
            message: "Task status toggled",
            task: updatedTask,
        });
    } catch (error: any) {
        console.error("Toggle error:", error);
        return res.status(500).json({ message: error.message });
    }
};