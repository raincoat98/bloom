import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CyclesModule } from './cycles/cycles.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { PushModule } from './push/push.module';
import { SymptomsModule } from './symptoms/symptoms.module';

@Module({
  imports: [DatabaseModule, AuthModule, CyclesModule, SymptomsModule, PushModule],
  controllers: [HealthController],
})
export class AppModule {}