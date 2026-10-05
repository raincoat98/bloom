import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { DatabaseError, Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import type { SignupDto } from './dto/signup.dto';

export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ token: string; user: PublicUser }> {
    // bcryptjs 의 동기 API 는 이벤트 루프를 막으므로 비동기 버전을 사용합니다.
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const { rows } = await this.pool.query<UserRow>(
        `INSERT INTO users (id, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, password_hash, created_at`,
        [randomUUID(), dto.email, hash],
      );
      const user = rows[0];
      return {
        token: await this.jwt.signAsync({ sub: user.id }),
        user: { id: user.id, email: user.email, createdAt: user.created_at },
      };
    } catch (err) {
      // 이메일 중복은 사전 조회 대신 유니크 제약으로 판정합니다 (동시 가입 경합 방지).
      if (err instanceof DatabaseError && err.code === '23505') {
        throw new ConflictException({
          error: '이미 가입된 이메일이에요. 로그인해 주세요.',
        });
      }
      throw err;
    }
  }

  async login(email: unknown, password: unknown): Promise<{ token: string; user: PublicUser }> {
    const { rows } = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [String(email ?? '').trim().toLowerCase()],
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(String(password ?? ''), user.password_hash))) {
      throw new UnauthorizedException({ error: '이메일 또는 비밀번호가 올바르지 않아요.' });
    }

    return {
      token: await this.jwt.signAsync({ sub: user.id }),
      user: { id: user.id, email: user.email, createdAt: user.created_at },
    };
  }

  async verifyToken(token: string): Promise<PublicUser> {
    let payload: { sub?: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub?: string }>(token);
    } catch {
      throw new UnauthorizedException({ error: '로그인이 만료됐어요. 다시 로그인해 주세요.' });
    }

    try {
      const { rows } = await this.pool.query<{ id: string; email: string; created_at: Date }>(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [payload.sub],
      );
      if (!rows[0]) {
        throw new UnauthorizedException({ error: '계정을 찾을 수 없어요.' });
      }
      return { id: rows[0].id, email: rows[0].email, createdAt: rows[0].created_at };
    } catch (err) {
      // sub 가 uuid 형식이 아니면 Postgres 가 22P02 를 던집니다. 500 대신 인증 실패로 처리.
      if (err instanceof DatabaseError && err.code === '22P02') {
        throw new UnauthorizedException({ error: '계정을 찾을 수 없어요.' });
      }
      throw err;
    }
  }
}