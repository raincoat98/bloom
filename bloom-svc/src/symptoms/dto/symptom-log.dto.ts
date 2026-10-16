import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const SYMPTOM_IDS = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'mood-swings',
  'backache',
  'skin-trouble',
  'cravings',
] as const;

export class SymptomLogDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '기록일 형식이 올바르지 않아요.' })
  logDate!: string;

  @IsArray({ message: '증상 목록 형식이 올바르지 않아요.' })
  @ArrayMinSize(1, { message: '증상을 하나 이상 선택해 주세요.' })
  @ArrayMaxSize(SYMPTOM_IDS.length, { message: '증상을 너무 많이 선택했어요.' })
  @ArrayUnique({ message: '같은 증상은 한 번만 선택할 수 있어요.' })
  @IsIn(SYMPTOM_IDS, { each: true, message: '지원하지 않는 증상이 포함되어 있어요.' })
  symptoms!: string[];

  @IsOptional()
  @IsString()
  savedAt?: string;
}
