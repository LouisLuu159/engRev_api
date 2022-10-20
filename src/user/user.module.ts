import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRT } from './entities/user_rt.entity';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRT]), HistoryModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
