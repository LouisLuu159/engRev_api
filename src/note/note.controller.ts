import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteService } from './note.service';

@ApiTags('Note')
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

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
  async getUserNotes(@Req() req) {
    const userId = req.user.id;
    const newNote = await this.noteService.getAllNote(userId);
    return newNote;
  }

  @Get('note-key/list')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get user's notes` })
  async getListOfNoteKey(@Req() req) {
    const userId = req.user.id;
    const newNote = await this.noteService.getListOfWordKey(userId);
    return newNote;
  }
}
