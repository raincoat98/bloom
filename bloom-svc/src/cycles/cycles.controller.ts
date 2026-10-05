import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthedRequest } from '../auth/auth.guard';
import { CyclesService } from './cycles.service';
import { CycleDto } from './dto/cycle.dto';

@Controller('api/cycles')
@UseGuards(AuthGuard)
export class CyclesController {
  constructor(private readonly cycles: CyclesService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.cycles.list(req.user.id);
  }

  @Put(':id')
  upsert(@Param('id') id: string, @Body() dto: CycleDto, @Req() req: AuthedRequest) {
    return this.cycles.upsert(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.cycles.remove(id, req.user.id);
  }
}