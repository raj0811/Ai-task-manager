import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { TaskService } from './task/task.service';
import { TaskModule } from './task/task.module';
import { ProjectModule } from './project/project.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.DB!),
    DatabaseModule,
    UserModule,
    TaskModule,
    ProjectModule,
    RedisModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    DatabaseService,
    UserService,
    TaskService,
    RedisService
  ]
})
export class AppModule { }
