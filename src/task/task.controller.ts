import {
    Controller,
    Post,
    UseGuards,
    Body,
    Req,
    Query,
    Get,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from 'src/AuthGuards/user.auth.guard';
import { TaskStatus } from 'src/database/Schema/task.schema';
import { RedisService } from 'src/redis/redis.service';

@Controller('task')
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly redisService: RedisService,
    ) { }

    @Post('generate-summary')
    @UseGuards(JwtAuthGuard)
    async generateSummary(
        @Body('title') title: string,
        @Body('description') description: string,
    ) {

        return this.taskService.generateTaskSummary(title, description);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createTask(
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('summary') summary: string,
        @Body('dueDate') dueDate: string,
        @Body('projectId') projectId: string,
        @Req() req,
    ) {
        return this.taskService.saveTaskToDb(
            title,
            description,
            summary,
            req.user.id,
            dueDate,
            projectId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('fetch-all')
    async getAllTasks(@Query() query: any, @Req() req) {
        return this.taskService.getAllTasks(
            query,
            req.user.id,
        );
    }


    @Patch(':taskId')
    async editTask(
        @Param('taskId') taskId: string,
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('summary') summary: string,
        @Body('dueDate') dueDate: string,
        @Req() req,
    ) {
        return this.taskService.editTask(
            taskId,
            title,
            description,
            summary,
            req.user._id,
            dueDate,
        );
    }

    @Delete(':taskId')
    async deleteTask(
        @Param('taskId') taskId: string,
        @Req() req,
    ) {
        return this.taskService.deleteTask(
            taskId,
            req.user._id,
        );
    }

    @Patch(':taskId/status')
    async updateStatus(
        @Param('taskId') taskId: string,
        @Body('status') status: TaskStatus,
        @Req() req,
    ) {
        return this.taskService.updateTaskStatus(
            taskId,
            status,
            req.user._id,
        );
    }
}
