import { Pool } from 'pg';

export function createPool(): Pool {
  // DATABASE_URL 이 있으면 그대로 쓰고, 없으면 libpq 표준 변수(PGHOST/PGUSER/...)를 씁니다.
  // compose 에서 비밀번호를 두 곳에 중복 기재하지 않기 위한 구조입니다.
  const target = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'bloom',
        password: process.env.PGPASSWORD || 'bloom',
        database: process.env.PGDATABASE || 'bloom',
      };

  const pool = new Pool({
    ...target,
    max: Math.max(1, Number(process.env.PG_POOL_MAX || 10)),
    ...(process.env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  // 유휴 커넥션이 끊겨도 프로세스가 죽지 않게 처리
  pool.on('error', (err) => {
    console.error(`[db] idle client error: ${err.message}`);
  });

  return pool;
}

export interface Migration {
  version: number;
  sql: string;
}

/**
 * 순서대로 적용되는 스키마 마이그레이션 목록.
 * 이미 적용된 버전은 schema_migrations 로 건너뜁니다. 기존 항목은 절대 수정하지 말고
 * 새 버전을 append 하세요.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE users (
        id uuid PRIMARY KEY,
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE cycles (
        id text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_period_date date NOT NULL,
        cycle_length integer NOT NULL,
        period_length integer NOT NULL,
        saved_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL,
        UNIQUE (user_id, last_period_date)
      );

      CREATE INDEX idx_cycles_user_saved ON cycles (user_id, saved_at DESC);
    `,
  },
];

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version integer PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query<{ version: number }>('SELECT version FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.version));

  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migration.sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [
        migration.version,
      ]);
      await client.query('COMMIT');
      console.log(`[db] applied migration ${migration.version}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}