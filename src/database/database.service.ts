import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './Schema/user.schema';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './Schema/task.schema';
import { Project, ProjectDocument } from './Schema/project.schema';

@Injectable()
export class DatabaseService {

    constructor(
        @InjectModel(User.name)
        public readonly userModel: Model<UserDocument>,
        @InjectModel(Task.name)
        public readonly taskModel: Model<TaskDocument>,
        @InjectModel(Project.name)
        public readonly projectModel: Model<ProjectDocument>
    ) { }


}
