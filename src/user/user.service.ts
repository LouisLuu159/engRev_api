import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { compareHash, hashString } from 'src/common/utils/authHelper';
import { UserRT } from './entities/user_rt.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRT) private userRTRepo: Repository<UserRT>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const new_user = this.userRepo.create(createUserDto);
    return this.userRepo.save(new_user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: id } });
    if (user === undefined)
      throw new NotFoundException(ResponseErrors.NOT_FOUND);

    const updating_user: User = { ...user, ...updateUserDto };
    return this.userRepo.save(updating_user);
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
    return this.userRepo.findOne({ where: { id: id } });
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
}
