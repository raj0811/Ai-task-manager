import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProjectService {
    constructor(
        private readonly databaseService: DatabaseService
    ) { }

    async createProject(
        name: string,
        description: string,
        userId: string
    ) {
        try {
            console.log(userId, "iooiop");

            const project = await this.databaseService.projectModel.create({
                name,
                description,
                ownerId: new Types.ObjectId(userId)
            })
            return project
        } catch (e) {
            console.log(e, 'rr');

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

            return project;
        } catch (e) {
            throw e;
        }
    }

    async deleteProject(
        projectId: string,
        userId: string
    ) {
        try {
            const project = await this.databaseService.projectModel.findByIdAndDelete(
                new Types.ObjectId(projectId),
            );

            if (!project) {
                throw new NotFoundException('Project not found');
            }

            if (project.ownerId.toString() !== userId) {
                throw new ForbiddenException(
                    'You cannot delete this project',
                );
            }

            return {
                success: true,
                message: 'Project deleted successfully',
            };
        } catch (e) {
            throw e;
        }
    }

    async getProject(
        projectId: string,
        userId: string
    ) {
        try {
            const project = await this.databaseService.projectModel.findOne({
                _id: new Types.ObjectId(projectId),
                createdBy: new Types.ObjectId(userId),
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
            console.log({ userId });

            const { status } = query
            const filter: any = {
                ownerId: new Types.ObjectId(userId),
            };
            if (status) {
                filter.status = status
            }
            const projects = await this.databaseService.projectModel.find(filter)
            return projects
        } catch (e) {
            throw e
        }
    }
}
