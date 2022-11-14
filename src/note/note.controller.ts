import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNoteQueryDto } from './dto/query.dto';
import { NoteService } from './note.service';
import { NoteSearchService } from './noteSearch.service';

@ApiTags('Note')
@Controller('note')
export class NoteController {
  constructor(
    private readonly noteSearchService: NoteSearchService,
    private readonly noteService: NoteService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Create note successfully` })
  async createNote(@Req() req, @Body() createNoteDto: CreateNoteDto) {
    const userId = req.user.id;
    const newNote = await this.noteService.createNote(userId, createNoteDto);
    return newNote;
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get user's notes` })
  async getUserNotes(@Req() req, @Query() query: GetNoteQueryDto) {
    const userId = req.user.id;
    const newNote = await this.noteService.getUserNotes(userId, query.wordKey);
    return newNote;
  }

  @Get('note-key/list')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get user's note keys` })
  async getListOfNoteKey(@Req() req) {
    const userId = req.user.id;
    const noteKeys = await this.noteSearchService.getListOfNoteKey(userId);
    return { noteKeys: noteKeys };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Delete Note` })
  async deleteNote(@Req() req, @Param('id') noteId: string) {
    const userId = req.user.id;
    await this.noteService.deleteNote(userId, noteId);
    return { message: 'Delete Note Successfully' };
  }
}
