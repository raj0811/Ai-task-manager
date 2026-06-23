import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [DatabaseModule, UserModule,
    RedisModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
