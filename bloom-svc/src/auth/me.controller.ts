import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthedRequest } from './auth.guard';

@Controller('api')
export class MeController {
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return { user: req.user };
  }
}