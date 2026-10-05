import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

const CYCLE_LENGTH_MESSAGE = '주기는 1~120일 사이여야 해요.';
const PERIOD_LENGTH_MESSAGE = '생리 기간은 1~30일 사이여야 해요.';

export class CycleDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '시작일 형식이 올바르지 않아요.' })
  lastPeriodDate!: string;

  @IsInt({ message: CYCLE_LENGTH_MESSAGE })
  @Min(1, { message: CYCLE_LENGTH_MESSAGE })
  @Max(120, { message: CYCLE_LENGTH_MESSAGE })
  cycleLength!: number;

  @IsInt({ message: PERIOD_LENGTH_MESSAGE })
  @Min(1, { message: PERIOD_LENGTH_MESSAGE })
  @Max(30, { message: PERIOD_LENGTH_MESSAGE })
  periodLength!: number;

  @IsOptional()
  @IsString()
  savedAt?: string;
}