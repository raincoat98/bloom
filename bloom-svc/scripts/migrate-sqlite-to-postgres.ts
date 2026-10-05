import fs from 'node:fs';
import Database from 'better-sqlite3';
import { createPool, migrate } from '../src/database/db';

// SQLite(bloom-svc/data/bloom.db)의 기존 계정·주기 기록을 Postgres 로 옮깁니다.
// 여러 번 실행해도 안전하도록 충돌 시 건너뜁니다.
//
//   SQLITE_PATH=data/bloom.db DATABASE_URL=postgres://... npm run migrate:from-sqlite

const sqlitePath = process.env.SQLITE_PATH || 'data/bloom.db';

async function main(): Promise<void> {
  if (!fs.existsSync(sqlitePath)) {
    console.error(`[migrate] SQLite 파일을 찾을 수 없어요: ${sqlitePath}`);
    process.exit(1);
  }

  const sqlite = new Database(sqlitePath, { readonly: true });
  const pool = createPool();

  try {
    await migrate(pool);

    const users = sqlite.prepare('SELECT * FROM users').all() as Record<string, unknown>[];
    const cycles = sqlite.prepare('SELECT * FROM cycles').all() as Record<string, unknown>[];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const user of users) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, created_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [user.id, user.email, user.password_hash, user.created_at],
        );
      }
      for (const cycle of cycles) {
        await client.query(
          `INSERT INTO cycles (
             id, user_id, last_period_date, cycle_length, period_length, saved_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            cycle.id,
            cycle.user_id,
            cycle.last_period_date,
            cycle.cycle_length,
            cycle.period_length,
            cycle.saved_at,
            cycle.updated_at,
          ],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const { rows } = await pool.query<{ users: string; cycles: string }>(
      'SELECT (SELECT COUNT(*) FROM users)::text AS users, (SELECT COUNT(*) FROM cycles)::text AS cycles',
    );
    console.log(
      `[migrate] sqlite users=${users.length} cycles=${cycles.length} -> postgres users=${rows[0].users} cycles=${rows[0].cycles}`,
    );
  } finally {
    sqlite.close();
    await pool.end();
  }
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});