import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SymptomsController } from './symptoms.controller';
import { SymptomsService } from './symptoms.service';

@Module({
  imports: [AuthModule],
  controllers: [SymptomsController],
  providers: [SymptomsService],
})
export class SymptomsModule {}
