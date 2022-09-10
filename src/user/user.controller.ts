import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get User's Information` })
  async getInfo(@Req() req) {
    const id = req.user.id;
    const user = await this.userService.getUserById(id);
    return user;
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get User's Information` })
  @ApiBody({ type: UpdateUserDto })
  async update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const id = req.user.id;
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }
}
