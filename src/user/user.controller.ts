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
  Query,
  BadRequestException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateConfigDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from './entities/user.entity';
import { HistoryService } from 'src/history/history.service';
import { UserConfig } from './entities/user_config.entity';
import { GetTestQueryDto } from 'src/eng_test/dto/query.dto';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { AddHistoryNoteDto } from 'src/history/dto/addNote.dto';
import { UpdateHistoryNoteDto } from 'src/history/dto/update-historyNote';
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
  @ApiOkResponse({ description: `Update user info` })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const id = req.user.id;
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }

  @Patch('update/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Update user account's password` })
  @ApiBody({ type: UpdatePasswordDto })
  async updatePassword(
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const id = req.user.id;
    const user = await this.userService.updatePassword(id, updatePasswordDto);
    return user;
  }

  @Patch('update-config')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Update config` })
  @ApiBody({ type: UpdateConfigDto })
  async updateConfig(
    @Req() req,
    @Body() updateConfigDto: UpdateConfigDto,
  ): Promise<UserConfig> {
    const id = req.user.id;
    const new_config = await this.userService.updateConfig(id, updateConfigDto);
    return new_config;
  }

  @Get('/history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get Practice History` })
  async listHistory(@Req() req, @Query() query: GetTestQueryDto) {
    const userId = req.user.id;
    let records;
    if (Object.keys(query).length == 0)
      records = await this.historyService.listHistory(userId);
    else records = await this.historyService.listHistory(userId, query);
    return records;
  }

  @Get('/history/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get History Detail` })
  async getHistoryDetail(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    const detail = await this.historyService.getHistoryDetail(userId, id);

    if (!detail) throw new NotFoundException(ResponseErrors.NOT_FOUND);
    return detail;
  }

  @Delete('/history/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Delete History` })
  async deleteHistory(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.historyService.deleteHistory(userId, id);
    return { message: 'Delete Successfully' };
  }

  @Get('/history/:id/notes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Get History's Note` })
  async getHistoryNote(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    const detail = await this.historyService.getHistoryNote(userId, id);
    return detail;
  }

  @Post('/history/note')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Create History Note` })
  async createHistoryNote(@Req() req, @Body() body: AddHistoryNoteDto) {
    const userId = req.user.id;
    const historyNote = await this.historyService.createHistoryNote(
      userId,
      body,
    );
    return historyNote;
  }

  @Put('/history/note/:historyNoteId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Update History Note` })
  async updateHistoryNote(
    @Req() req,
    @Param('historyNoteId') historyNoteId: string,
    @Body() body: UpdateHistoryNoteDto,
  ) {
    const userId = req.user.id;
    const newHistoryNote = await this.historyService.updateHistoryNote(
      userId,
      historyNoteId,
      body,
    );
    return newHistoryNote;
  }

  @Delete('/history/note/:historyNoteId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: `Delete History Note` })
  async deleteHistoryNote(
    @Req() req,
    @Param('historyNoteId') historyNoteId: string,
  ) {
    const userId = req.user.id;
    await this.historyService.deleteHistoryNote(userId, historyNoteId);
    return { message: 'Delete Successfully' };
  }
}
