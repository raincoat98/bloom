import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import type { SymptomLogDto } from './dto/symptom-log.dto';

const SYMPTOM_LOG_COLUMNS = `
  id,
  log_date::text AS "logDate",
  symptoms,
  saved_at AS "savedAt"
`;

export interface SymptomLogEntry {
  id: string;
  logDate: string;
  symptoms: string[];
  savedAt: Date;
}

@Injectable()
export class SymptomsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async list(userId: string): Promise<{ records: SymptomLogEntry[] }> {
    const { rows } = await this.pool.query<SymptomLogEntry>(
      `SELECT ${SYMPTOM_LOG_COLUMNS}
       FROM symptom_logs
       WHERE user_id = $1
       ORDER BY log_date DESC, saved_at DESC`,
      [userId],
    );
    return { records: rows };
  }

  async upsert(
    id: string,
    dto: SymptomLogDto,
    userId: string,
  ): Promise<{ record: SymptomLogEntry }> {
    const now = new Date();
    const { rows } = await this.pool.query<SymptomLogEntry>(
      `INSERT INTO symptom_logs (id, user_id, log_date, symptoms, saved_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, log_date) DO UPDATE SET
         id = EXCLUDED.id,
         symptoms = EXCLUDED.symptoms,
         saved_at = EXCLUDED.saved_at,
         updated_at = EXCLUDED.updated_at
       RETURNING ${SYMPTOM_LOG_COLUMNS}`,
      [id, userId, dto.logDate, dto.symptoms, dto.savedAt || now, now],
    );
    return { record: rows[0] };
  }

  async remove(id: string, userId: string): Promise<void> {
    const { rowCount } = await this.pool.query(
      'DELETE FROM symptom_logs WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (rowCount === 0) {
      throw new NotFoundException({ error: '증상 기록을 찾을 수 없어요.' });
    }
  }
}
