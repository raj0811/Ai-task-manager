import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Schema/user.schema';
import { DatabaseService } from './database.service';
import { Task, TaskSchema } from './Schema/task.schema';
import { Project, ProjectSchema } from './Schema/project.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Task.name, schema: TaskSchema },
            { name: Project.name, schema: ProjectSchema }
        ])
    ],
    providers: [DatabaseService],
    exports: [
        MongooseModule,
        DatabaseService
    ]
})
export class DatabaseModule { }
