import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import mongoose from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';
import { ProjectStatus } from '../database/Schema/project.schema';
describe('ProjectService', () => {
  let service: ProjectService;
  let databaseService: DatabaseService;
  let redisService: RedisService
  beforeEach(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new BadRequestException('invalid uri');
    }

    console.log('🧠 Using Mongo URI:', uri);
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        DatabaseModule,
        RedisModule
      ],
      providers: [ProjectService, DatabaseService],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });


  afterEach(async () => {
    await databaseService.userModel.deleteMany({});
    await databaseService.projectModel.deleteMany({});
    await databaseService.taskModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create project', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: "test@gmail.com",
      password: '12345'
    })
    const result = await service.createProject('test', 'test desc', user._id.toString())
    //check if document is really created in db 

    const checkDB = await databaseService.projectModel.findById(result._id)
    expect(checkDB?._id.toString()).toEqual(result._id.toString())

    //checking result
    expect(result.ownerId.toString()).toEqual(user._id.toString())
    expect(result.name).toEqual('test')
    expect(result.description).toEqual('test desc')
  })

  it('should throw Error for invalid User', async () => {
    await expect(
      service.createProject(
        'test',
        'test desc',
        new mongoose.Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(BadRequestException);

  })

  it('should update Project info', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: "test2@gmail.com",
      password: '12345'
    })
    const project = await service.createProject('test', 'test desc', user._id.toString())

    const result = await service.updateProject(
      project._id.toString(),
      'test2',
      'new desc',
      user._id.toString()
    )

    expect(result.name).toEqual('test2')
    //check db for changes
    const check = await databaseService.projectModel.findById(project._id)
    expect(check?.name).toEqual('test2')


  })

  it('should throw Project not found', async () => {
    await expect(service.updateProject(
      new mongoose.Types.ObjectId().toString(),
      'test2',
      'new desc',
      new mongoose.Types.ObjectId().toString()
    )).rejects.toThrow(NotFoundException)
  })

  it('should throw You cannot update this project', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: "test4@gmail.com",
      password: '12345'
    })
    const project = await service.createProject('test', 'test desc', user._id.toString())

    await expect(service.updateProject(
      project._id.toString(),
      'test2',
      'new desc',
      new mongoose.Types.ObjectId().toString()
    )).rejects.toThrow(ForbiddenException)
  })

  it('should delete project', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: "test27878@gmail.com",
      password: '12345'
    })
    const project = await service.createProject('test', 'test desc', user._id.toString())
    const task = await databaseService.taskModel.create({
      title: "refund",
      description: "add refund feature",
      summary: "**Objective:** ",
      projectId: project._id,
      createdBy: user._id
    })
    const result = await service.deleteProject(project._id.toString(), user._id.toString())
    const checkProject = await databaseService.projectModel.findById(project._id)
    expect(checkProject).toEqual(null)
    const checkTask = await databaseService.taskModel.find({ projectId: project._id })
    expect(checkTask.length).toEqual(0)
  })

  it('should throw NotfoundException', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: "test@gmail.com",
      password: '12345'
    })
    const project = await service.createProject('test', 'test desc', user._id.toString())
    const task = await databaseService.taskModel.create({
      title: "refund",
      description: "add refund feature",
      summary: "**Objective:** ",
      projectId: project._id,
      createdBy: user._id
    })
    await expect(
      service.deleteProject(
        project._id.toString(),
        new mongoose.Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(NotFoundException);

  })

  it('should get project by id', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: 'test@gmail.com',
      password: '12345',
    });

    const project = await service.createProject(
      'test',
      'test desc',
      user._id.toString(),
    );


    const result = await service.getProject(
      project._id.toString(),
      user._id.toString(),
    );



    expect(result).toBeDefined();
    expect(result._id.toString()).toEqual(project._id.toString());
    expect(result.name).toEqual('test');
    expect(result.description).toEqual('test desc');
  });

  it('should throw NotFoundException if project does not belong to user', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: 'test@gmail.com',
      password: '12345',
    });

    const project = await service.createProject(
      'test',
      'test desc',
      user._id.toString(),
    );

    await expect(
      service.getProject(
        project._id.toString(),
        new mongoose.Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should get all projects of user', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: 'test@gmail.com',
      password: '12345',
    });

    await service.createProject('test', 'test desc', user._id.toString());
    await service.createProject('test2', 'test desc', user._id.toString());
    await service.createProject('test3', 'test desc', user._id.toString());

    const result = await service.getAllProjects(
      user._id.toString(),
      {},
    );

    expect(result.length).toBe(3);
    expect(result[0].ownerId.toString()).toEqual(user._id.toString());
  });

  it('should get projects by status filter', async () => {
    const user = await databaseService.userModel.create({
      name: 'raj',
      email: 'test@gmail.com',
      password: '12345',
    });

    await service.createProject('test', 'test desc', user._id.toString());
    await service.createProject('test2', 'test desc', user._id.toString());

    await databaseService.projectModel.create({
      name: 'completed project',
      description: 'done',
      ownerId: user._id,
      status: ProjectStatus.COMPLETED
    });

    const result = await service.getAllProjects(
      user._id.toString(),
      { status: 'COMPLETED' },
    );

    expect(result.length).toBe(1);
    expect(result[0].status).toBe('COMPLETED');
  });
});
