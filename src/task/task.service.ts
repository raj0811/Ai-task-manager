import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GoogleGenAI } from '@google/genai';
import { Types } from 'mongoose'
import { TaskStatus } from 'src/database/Schema/task.schema';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TaskService {
    private ai: GoogleGenAI;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly redisService: RedisService,
    ) {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }

    async generateTaskSummary(
        title: string,
        description: string,
    ) {
        try {
            const prompt = `
You are a project management assistant.

Based on the task title and description, generate a detailed professional task summary.

Include:
- Objective
- Key activities
- Expected outcome

Keep it between 80 and 150 words.

Task Title:
${title}

Task Description:
${description}

Return only the summary text.
`;


            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            return {
                success: true,
                summary: response.text,
            };
        } catch (e) {
            console.log(e);

            throw new BadRequestException(
                e?.message || 'Failed to generate summary',
            );
        }
    }

    async saveTaskToDb(
        title: string,
        description: string,
        summary: string,
        user: string,
        dueDate: string,
        projectId: string
    ) {
        try {
            const task = await this.databaseService.taskModel.create({
                title,
                description,
                summary,
                createdBy: new Types.ObjectId(user),
                dueDate: new Date(dueDate),
                projectId: new Types.ObjectId(projectId)
            })
            return task
        } catch (e) {
            throw e
        }
    }

    async editTask(
        taskId: string,
        title: string,
        description: string,
        summary: string,
        userId: string,
        dueDate: string,
    ) {
        try {
            const task = await this.databaseService.taskModel.findOne({
                _id: new Types.ObjectId(taskId),
                createdBy: new Types.ObjectId(userId),
            });

            if (!task) {
                throw new BadRequestException(
                    'Task not found or access denied',
                );
            }

            task.title = title;
            task.description = description;
            task.summary = summary;

            if (dueDate) {
                task.dueDate = new Date(dueDate);
            }

            await task.save();

            return task;
        } catch (e) {
            throw e
        }
    }

    async deleteTask(
        taskId: string,
        userId: string,
    ) {
        try {
            const task =
                await this.databaseService.taskModel.findOneAndDelete({
                    _id: new Types.ObjectId(taskId),
                    createdBy: new Types.ObjectId(userId),
                });

            if (!task) {
                throw new NotFoundException(
                    'Task not found or access denied',
                );
            }
            await this.redisService.delPattern(`tasks:${userId}:*`);
            return {
                success: true,
                message: 'Task deleted successfully',
            };
        } catch (e) {
            throw e;
        }
    }

    async updateTaskStatus(
        taskId: string,
        status: TaskStatus,
        userId: string,
    ) {
        try {
            const task = await this.databaseService.taskModel.findById(
                new Types.ObjectId(taskId),
            );

            if (!task) {
                throw new NotFoundException('Task not found');
            }

            // ownership check
            if (task.createdBy.toString() !== userId) {
                throw new ForbiddenException(
                    'You cannot update this task',
                );
            }

            // validate status
            const allowedStatuses = Object.values(TaskStatus);
            if (!allowedStatuses.includes(status)) {
                throw new BadRequestException('Invalid status value');
            }

            task.status = status;
            await task.save();

            return {
                success: true,
                message: 'Task status updated successfully',
                data: task,
            };
        } catch (e) {
            throw e;
        }

    }


    async getAllTasks(query: any, userId: string) {
        try {
            const cacheKey = `tasks:${userId}:${JSON.stringify(query)}`;

            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            const {
                status,
                search,
                startDate,
                endDate,
                dueStart,
                dueEnd,
                page = 1,
                limit = 50,
            } = query;

            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            const filter: any = {
                createdBy: new Types.ObjectId(userId),
            };

            if (status) {
                filter.status = status;
            }

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { summary: { $regex: search, $options: 'i' } },
                ];
            }

            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate);
            }

            if (dueStart || dueEnd) {
                filter.dueDate = {};
                if (dueStart) filter.dueDate.$gte = new Date(dueStart);
                if (dueEnd) filter.dueDate.$lte = new Date(dueEnd);
            }

            const skip = (pageNumber - 1) * limitNumber;

            const [tasks, total] = await Promise.all([
                this.databaseService.taskModel
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNumber),

                this.databaseService.taskModel.countDocuments(filter),
            ]);

            const result = {
                success: true,
                data: tasks,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            };

            await this.redisService.set(cacheKey, result, 300);

            return result;
        } catch (e) {
            throw e;
        }
    }
}