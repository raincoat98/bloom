import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

const PASSWORD_MESSAGE = '비밀번호는 6자 이상이어야 해요.';

export class SignupDto {
  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  @IsEmail({}, { message: '올바른 이메일 주소를 입력해 주세요.' })
  email!: string;

  @IsString({ message: PASSWORD_MESSAGE })
  @MinLength(6, { message: PASSWORD_MESSAGE })
  password!: string;
}