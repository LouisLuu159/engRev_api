import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetPartQueryDto } from './dto/query.dto';
import { PartService } from './part.service';

@ApiTags('Part')
@Controller('part')
export class PartController {
  constructor(private readonly partService: PartService) {}

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ description: `Get Answer Data` })
  // async getAnswer(@Param('id') partId: string) {
  //   return this.partService.getPart(partId);
  // }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: `Get Answer Data` })
  async getPart(@Param('id') partId: string, @Query() query: GetPartQueryDto) {
    return this.partService.getPart(partId, query);
  }
}
