import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { TaskService } from './task.service';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { TaskStatus } from '../database/Schema/task.schema';

describe('TaskService', () => {
  let service: TaskService;
  let databaseService: DatabaseService;
  let redisService: RedisService;

  beforeEach(async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new BadRequestException('invalid uri');
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        DatabaseModule,
        RedisModule,
      ],
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    // redisService = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await databaseService.userModel.deleteMany({});
    await databaseService.projectModel.deleteMany({});
    await databaseService.taskModel.deleteMany({});
  });

  afterAll(async () => {
    // await redisService?.onModuleDestroy?.();
    await mongoose.connection.close();
  });

  const createUserAndProject = async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: 'test@gmail.com',
      password: '12345',
    });
    console.log(user, 'user');

    const project = await databaseService.projectModel.create({
      name: 'Test Project',
      description: 'Project Desc',
      ownerId: user._id,
    });
    console.log(project, 'project');

    return { user, project };
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save task to DB', async () => {
    const { user, project } = await createUserAndProject();

    const result = await service.saveTaskToDb(
      'Refund',
      'Add refund feature',
      'Refund summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    console.log(result);


    expect(result).toBeDefined();
    expect(result.title).toBe('Refund');
    expect(result.description).toBe('Add refund feature');
    expect(result.summary).toBe('Refund summary');
    expect(result.createdBy.toString()).toBe(user._id.toString());
    expect(result.projectId.toString()).toBe(project._id.toString());

    const checkDb = await databaseService.taskModel.findById(result._id);
    expect(checkDb).toBeDefined();
    expect(checkDb?.title).toBe('Refund');
  });

  it('should edit task', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Old Task',
      'Old desc',
      'Old summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    const result = await service.editTask(
      task._id.toString(),
      'Updated Task',
      'Updated desc',
      'Updated summary',
      user._id.toString(),
      '2025-08-01',
    );

    expect(result.title).toBe('Updated Task');
    expect(result.description).toBe('Updated desc');
    expect(result.summary).toBe('Updated summary');

    const checkDb = await databaseService.taskModel.findById(task._id);
    expect(checkDb?.title).toBe('Updated Task');
  });

  it('should throw error while editing task of another user', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await expect(
      service.editTask(
        task._id.toString(),
        'Updated Task',
        'Updated desc',
        'Updated summary',
        new mongoose.Types.ObjectId().toString(),
        '2025-08-01',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should delete task', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    const result = await service.deleteTask(
      task._id.toString(),
      user._id.toString(),
    );

    expect(result.success).toBe(true);

    const checkDb = await databaseService.taskModel.findById(task._id);
    expect(checkDb).toBeNull();
  });

  it('should throw NotFoundException while deleting task of another user', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await expect(
      service.deleteTask(
        task._id.toString(),
        new mongoose.Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update task status', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    const result = await service.updateTaskStatus(
      task._id.toString(),
      TaskStatus.IN_PROGRESS,
      user._id.toString(),
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe(TaskStatus.IN_PROGRESS);

    const checkDb = await databaseService.taskModel.findById(task._id);
    expect(checkDb?.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should throw ForbiddenException if another user updates task status', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await expect(
      service.updateTaskStatus(
        task._id.toString(),
        TaskStatus.DONE,
        new mongoose.Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException for invalid task status', async () => {
    const { user, project } = await createUserAndProject();

    const task = await service.saveTaskToDb(
      'Task',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await expect(
      service.updateTaskStatus(
        task._id.toString(),
        'INVALID_STATUS' as TaskStatus,
        user._id.toString(),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should get all tasks with pagination', async () => {
    const { user, project } = await createUserAndProject();

    await service.saveTaskToDb(
      'Refund',
      'Add refund feature',
      'Summary 1',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await service.saveTaskToDb(
      'Login',
      'Fix login issue',
      'Summary 2',
      user._id.toString(),
      '2025-07-02',
      project._id.toString(),
    );

    const result = await service.getAllTasks(
      {
        page: 1,
        limit: 10,
      },
      user._id.toString(),
    );

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.page).toBe(1);
  });

  it('should get tasks by search', async () => {
    const { user, project } = await createUserAndProject();

    await service.saveTaskToDb(
      'Refund',
      'Add refund feature',
      'Payment refund summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await service.saveTaskToDb(
      'Login',
      'Fix login issue',
      'Auth summary',
      user._id.toString(),
      '2025-07-02',
      project._id.toString(),
    );

    const result = await service.getAllTasks(
      {
        search: 'refund',
      },
      user._id.toString(),
    );

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].title).toBe('Refund');
  });

  it('should get tasks by status filter', async () => {
    const { user, project } = await createUserAndProject();

    const task1 = await service.saveTaskToDb(
      'Task 1',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-01',
      project._id.toString(),
    );

    await service.saveTaskToDb(
      'Task 2',
      'Desc',
      'Summary',
      user._id.toString(),
      '2025-07-02',
      project._id.toString(),
    );

    await service.updateTaskStatus(
      task1._id.toString(),
      TaskStatus.DONE,
      user._id.toString(),
    );

    const result = await service.getAllTasks(
      {
        status: TaskStatus.DONE,
      },
      user._id.toString(),
    );

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].status).toBe(TaskStatus.DONE);
  });


});