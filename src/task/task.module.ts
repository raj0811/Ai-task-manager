import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, UserModule,
    RedisModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
