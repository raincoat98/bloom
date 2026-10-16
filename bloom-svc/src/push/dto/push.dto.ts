import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PushKeysDto {
  @IsString({ message: 'p256dh 키가 필요해요.' })
  @IsNotEmpty({ message: 'p256dh 키는 비어 있을 수 없어요.' })
  p256dh!: string;

  @IsString({ message: 'auth 키가 필요해요.' })
  @IsNotEmpty({ message: 'auth 키는 비어 있을 수 없어요.' })
  auth!: string;
}

export class PushPreferencesDto {
  @IsOptional()
  @IsBoolean()
  periodBefore?: boolean;

  @IsOptional()
  @IsBoolean()
  fertileBefore?: boolean;

  @IsOptional()
  @IsBoolean()
  symptomReminder?: boolean;
}

export class PushCycleInfoDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '시작일 형식이 올바르지 않아요.' })
  lastPeriodDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  cycleLength?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  periodLength?: number;
}

export class SubscribePushDto {
  @IsString({ message: 'endpoint 주소가 필요해요.' })
  @IsNotEmpty({ message: 'endpoint 는 비어 있을 수 없어요.' })
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PushPreferencesDto)
  preferences?: PushPreferencesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PushCycleInfoDto)
  cycleInfo?: PushCycleInfoDto;
}

export class UnsubscribePushDto {
  @IsString({ message: 'endpoint 주소가 필요해요.' })
  @IsNotEmpty({ message: 'endpoint 는 비어 있을 수 없어요.' })
  endpoint!: string;
}

export class TestPushDto {
  @IsString({ message: 'endpoint 주소가 필요해요.' })
  @IsNotEmpty({ message: 'endpoint 는 비어 있을 수 없어요.' })
  endpoint!: string;

  @IsOptional()
  @IsIn(['period', 'fertile', 'symptom', 'custom'])
  type?: 'period' | 'fertile' | 'symptom' | 'custom';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

export class DispatchPushDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '날짜 형식이 올바르지 않아요.' })
  targetDate?: string;
}
