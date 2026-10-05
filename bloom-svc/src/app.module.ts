import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CyclesModule } from './cycles/cycles.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [DatabaseModule, AuthModule, CyclesModule],
  controllers: [HealthController],
})
export class AppModule {}