import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, UserModule, RedisModule],
  providers: [ProjectService],
  controllers: [ProjectController]
})
export class ProjectModule { }
