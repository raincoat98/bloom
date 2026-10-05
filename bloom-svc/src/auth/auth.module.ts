import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../config';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { MeController } from './me.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpiresIn },
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, AuthGuard],
  // AuthGuard 를 다른 모듈에서 쓰려면 가드가 의존하는 AuthService 도 export 해야 합니다.
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}