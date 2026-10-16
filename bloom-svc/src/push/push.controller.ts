import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  DispatchPushDto,
  SubscribePushDto,
  TestPushDto,
  UnsubscribePushDto,
} from './dto/push.dto';
import { PushService } from './push.service';

@Controller('api/push')
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly authService: AuthService,
  ) {}

  private async extractUserId(req: Request): Promise<string | null> {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;

    try {
      const user = await this.authService.verifyToken(token);
      return user.id;
    } catch {
      return null;
    }
  }

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.pushService.getVapidPublicKey();
  }

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribePushDto, @Req() req: Request) {
    const userId = await this.extractUserId(req);
    return this.pushService.subscribe(dto, userId);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: UnsubscribePushDto) {
    return this.pushService.unsubscribe(dto.endpoint);
  }

  @Get('status')
  async getStatus(@Query('endpoint') endpoint: string, @Req() req: Request) {
    const userId = await this.extractUserId(req);
    return this.pushService.getStatus(endpoint || '', userId);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  sendTest(@Body() dto: TestPushDto) {
    return this.pushService.sendTest(dto);
  }

  @Post('dispatch')
  @HttpCode(HttpStatus.OK)
  dispatch(@Body() dto: DispatchPushDto) {
    return this.pushService.dispatchScheduled(dto);
  }
}
