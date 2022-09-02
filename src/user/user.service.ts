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
import * as bcrypt from 'bcrypt';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  private async hashString(str: string): Promise<string> {
    const salt = await bcrypt.genSalt(10, 'a');
    const hashedStr = await bcrypt.hash(str, salt);
    return hashedStr;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const checkEmailExist = await this.getUserByEmail(createUserDto.email);

    if (checkEmailExist)
      throw new BadRequestException(ResponseErrors.VALIDATION.EMAIL_EXIST);

    createUserDto.password = await this.hashString(createUserDto.password);

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
    const new_hashed_password = await this.hashString(new_password);
    await this.userRepo.update(user.id, { password: new_hashed_password });
    return user;
  }

  async checkCredential(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email: email } });
    if (user === undefined) return undefined;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return undefined;
    return user;
  }

  async getUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email: email } });
  }

  async getUserById(id: string) {
    return this.userRepo.findOne({ where: { id: id } });
  }
}
