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
import { User } from './entities/user.entity';
import { HistoryService } from 'src/history/history.service';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly historyService: HistoryService,
  ) {}

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get User's Information` })
  async getInfo(@Req() req) {
    const id = req.user.id;
    const user = await this.userService.getUserById(id);
    return user;
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get User's Information` })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const id = req.user.id;
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }

  @Get('/history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get Practice History` })
  async listHistory(@Req() req) {
    const userId = req.user.id;
    const records = await this.historyService.listHistory(userId);
    return records;
  }

  @Get('/history/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get History Detail` })
  async getHistoryDetail(@Param('id') id: string) {
    const detail = await this.historyService.getHistoryDetail(id);
    return detail;
  }
}
