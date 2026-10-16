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
import { SymptomLogDto } from './dto/symptom-log.dto';
import { SymptomsService } from './symptoms.service';

@Controller('api/symptoms')
@UseGuards(AuthGuard)
export class SymptomsController {
  constructor(private readonly symptoms: SymptomsService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.symptoms.list(req.user.id);
  }

  @Put(':id')
  upsert(@Param('id') id: string, @Body() dto: SymptomLogDto, @Req() req: AuthedRequest) {
    return this.symptoms.upsert(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.symptoms.remove(id, req.user.id);
  }
}
