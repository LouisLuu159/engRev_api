import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateConfigDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { compareHash, hashString } from 'src/common/utils/authHelper';
import { UserRT } from './entities/user_rt.entity';
import { UserStatus } from './entities/user_status.entity';
import { UserConfig } from './entities/user_config.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRT) private userRTRepo: Repository<UserRT>,
    @InjectRepository(UserStatus)
    private userStatusRepo: Repository<UserStatus>,
    @InjectRepository(UserConfig)
    private userConfigRepo: Repository<UserConfig>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const creating_user = await this.userRepo.create(createUserDto);
    const new_user = await this.userRepo.save(creating_user);
    delete new_user.password;
    return new_user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: id } });
    console.log(user);
    if (user === undefined)
      throw new NotFoundException(ResponseErrors.NOT_FOUND);

    const updating_user: User = { ...user, ...updateUserDto };
    const updated_user = await this.userRepo.save(updating_user);
    delete updated_user.password;
    return updated_user;
  }

  async updateConfig(userId: string, new_config: UpdateConfigDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      join: {
        alias: 'users',
        leftJoinAndSelect: {
          config: 'users.config',
        },
      },
    });
    const config = user.config || new UserConfig();
    if (new_config.goal) config.goal = new_config.goal;
    if (new_config.time_reminder)
      config.time_reminder = new_config.time_reminder;
    const updated_config = await this.userConfigRepo.save(config);

    user.config = updated_config;
    const updated_user = await this.userRepo.save(user);
    return updated_config;
  }

  async resetPassword(email: string, new_password: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email: email } });
    const match = await compareHash(new_password, user.password);
    if (match)
      throw new BadRequestException(
        ResponseErrors.VALIDATION.PASSWORD_NOT_CHANGE,
      );

    const new_hashed_password = await hashString(new_password);
    await this.userRepo.update(user.id, { password: new_hashed_password });
    await this.userRTRepo.delete({ userId: user.id }); //Remove all RefreshToken
    return user;
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { current_password, new_password } = updatePasswordDto;

    if (current_password === new_password)
      throw new BadRequestException('new_password must be different');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const match = await compareHash(current_password, user.password);

    if (!match)
      throw new BadRequestException('current_password is not correct');

    const new_hashed_password = await hashString(new_password);
    await this.userRepo.update(user.id, { password: new_hashed_password });
    await this.userRTRepo.delete({ userId: user.id }); //Remove all RefreshToken
    return user;
  }

  async checkCredential(login: string, password: string): Promise<User> {
    // Email in Login DTO could be an username
    const isEmail = login.split('@').length > 1;
    let user;
    if (isEmail) {
      // Check by Email
      const email = login;
      user = await this.userRepo.findOne({ where: { email: email } });
    } else {
      // Check by Username
      const username = login;
      user = await this.userRepo.findOne({ where: { username: username } });
    }
    if (user === undefined) return undefined;
    const valid = await compareHash(password, user.password);
    if (!valid) return undefined;
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.userRepo.findOne({ where: { email: email } });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.userRepo.findOne({ where: { username: username } });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: id },
      join: {
        alias: 'users',
        leftJoinAndSelect: {
          config: 'users.config',
          status: 'users.status',
        },
      },
    });
    return user;
  }

  async addRefreshToken(userId: string, token: string): Promise<UserRT> {
    const signature = token.split('.').slice(-1)[0];
    const creating_userRT = await this.userRTRepo.create({
      userId: userId,
      rt: signature,
    });
    const created_userRT = await this.userRTRepo.save(creating_userRT);
    return created_userRT;
  }

  async checkRefreshTokenExists(
    userId: string,
    token: string,
  ): Promise<boolean> {
    const signature = token.split('.').slice(-1)[0];
    const user_rt = await this.userRTRepo.findOne({ where: { rt: signature } });
    if (user_rt && user_rt.userId == userId) return true;
    return false;
  }

  async deleteRefreshToken(userId: string, token: string): Promise<void> {
    const signature = token.split('.').slice(-1)[0];
    await this.userRTRepo.delete({ rt: signature, userId: userId });
  }

  async updateLearningStatus(
    userId: string,
    newListeningScore: number,
    newReadingScore: number,
  ) {
    const user = await this.getUserById(userId);

    let new_status: UserStatus;
    if (user.status) new_status = { ...user.status };
    else new_status = { full_score: 0, listening_score: 0, reading_score: 0 };

    if (newListeningScore) new_status.listening_score = newListeningScore;
    if (newReadingScore) new_status.reading_score = newReadingScore;
    new_status.full_score =
      new_status.reading_score + new_status.listening_score;

    const updated_status = await this.userStatusRepo.save(new_status);
    const new_user = { ...user };
    new_user.status = updated_status;
    const updated_user = await this.userRepo.save(new_user);
    return updated_status;
  }

  async getUsersForReminder() {
    const users = await this.userRepo.find({
      join: {
        alias: 'users',
        leftJoinAndSelect: {
          config: 'users.config',
        },
      },
      select: ['email', 'id', 'config'],
    });
    return users;
  }
}
