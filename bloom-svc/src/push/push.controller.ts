import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthedRequest } from '../auth/auth.guard';
import {
  DispatchPushDto,
  SubscribePushDto,
  TestPushDto,
  UnsubscribePushDto,
} from './dto/push.dto';
import { PushService } from './push.service';

@Controller('api/push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.pushService.getVapidPublicKey();
  }

  @Post('subscribe')
  @UseGuards(AuthGuard)
  subscribe(@Body() dto: SubscribePushDto, @Req() req: AuthedRequest) {
    return this.pushService.subscribe(dto, req.user.id);
  }

  @Post('unsubscribe')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: UnsubscribePushDto, @Req() req: AuthedRequest) {
    return this.pushService.unsubscribe(dto.endpoint, req.user.id);
  }

  @Get('status')
  @UseGuards(AuthGuard)
  getStatus(@Query('endpoint') endpoint: string, @Req() req: AuthedRequest) {
    return this.pushService.getStatus(endpoint || '', req.user.id);
  }

  @Post('test')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  sendTest(@Body() dto: TestPushDto, @Req() req: AuthedRequest) {
    return this.pushService.sendTest(dto, req.user.id);
  }

  @Post('dispatch')
  @HttpCode(HttpStatus.OK)
  dispatch(@Body() dto: DispatchPushDto) {
    return this.pushService.dispatchScheduled(dto);
  }
}
