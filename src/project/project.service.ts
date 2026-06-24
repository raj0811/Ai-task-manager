import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProjectService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly redisService: RedisService
    ) { }

    async createProject(
        name: string,
        description: string,
        userId: string
    ) {
        try {
            console.log(userId, "iooiop");
            const checkuser = await this.databaseService.userModel.findById(userId)
            if (!checkuser) {
                throw new BadRequestException("Invalid User")
            }
            const project = await this.databaseService.projectModel.create({
                name,
                description,
                ownerId: new Types.ObjectId(userId)
            })
            await this.redisService.delPattern(`projects:${userId}:*`);
            return project
        } catch (e) {
            throw e
        }
    }
    async updateProject(
        projectId: string,
        name: string,
        description: string,
        userId: string
    ) {
        try {
            const project = await this.databaseService.projectModel.findById(
                new Types.ObjectId(projectId),
            );

            if (!project) {
                throw new NotFoundException('Project not found');
            }

            if (project.ownerId.toString() !== userId) {
                throw new ForbiddenException(
                    'You cannot update this project',
                );
            }

            project.name = name;
            project.description = description;
            await project.save();
            await this.redisService.delPattern(`projects:${userId}:*`);
            return project;
        } catch (e) {
            throw e;
        }
    }

    async deleteProject(projectId: string, userId: string) {
        const session =
            await this.databaseService.projectModel.db.startSession();

        try {
            session.startTransaction();
            console.log({ projectId, userId });

            const project = await this.databaseService.projectModel
                .findOneAndDelete({
                    _id: new Types.ObjectId(projectId),
                    ownerId: new Types.ObjectId(userId),
                })
                .session(session);

            if (!project) {
                throw new NotFoundException(
                    'Project not found or access denied',
                );
            }

            const deletedTasks =
                await this.databaseService.taskModel.deleteMany(
                    {
                        projectId: new Types.ObjectId(projectId),
                        createdBy: new Types.ObjectId(userId),
                    },
                    { session },
                );
            console.log(deletedTasks, 'deleted task');

            await session.commitTransaction();

            await this.redisService.delPattern(`projects:${userId}:*`);
            await this.redisService.delPattern(`tasks:${userId}:*`);

            return {
                success: true,
                message: 'Project and related tasks deleted successfully',
                deletedTasks: deletedTasks.deletedCount,
            };
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    async getProject(
        projectId: string,
        userId: string
    ) {
        try {
            const project = await this.databaseService.projectModel.findOne({
                _id: new Types.ObjectId(projectId),
                ownerId: new Types.ObjectId(userId),
            });

            if (!project) {
                throw new NotFoundException('Project not found');
            }

            return project;
        } catch (e) {
            throw e;
        }
    }

    async getAllProjects(
        userId: string,
        query: any
    ) {
        try {
            const cacheKey = `projects:${userId}:${JSON.stringify(query)}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const { status } = query
            const filter: any = {
                ownerId: new Types.ObjectId(userId),
            };
            if (status) {
                filter.status = status
            }
            const projects = await this.databaseService.projectModel.find(filter)
            await this.redisService.set(cacheKey, projects, 300);
            return projects
        } catch (e) {
            throw e
        }
    }
}
