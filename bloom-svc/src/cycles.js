import { Router } from 'express';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const toEntry = (row) => ({
  id: row.id,
  lastPeriodDate: row.last_period_date,
  cycleLength: row.cycle_length,
  periodLength: row.period_length,
  savedAt: row.saved_at,
});

export function cyclesRouter(db) {
  const router = Router();

  const listStmt = db.prepare(
    'SELECT * FROM cycles WHERE user_id = ? ORDER BY saved_at DESC',
  );
  const upsertStmt = db.prepare(`
    INSERT INTO cycles (
      id, user_id, last_period_date, cycle_length, period_length, saved_at, updated_at
    ) VALUES (
      @id, @userId, @lastPeriodDate, @cycleLength, @periodLength, @savedAt, @now
    )
    ON CONFLICT (user_id, last_period_date) DO UPDATE SET
      id = excluded.id,
      cycle_length = excluded.cycle_length,
      period_length = excluded.period_length,
      saved_at = excluded.saved_at,
      updated_at = excluded.updated_at
  `);
  const getStmt = db.prepare(
    'SELECT * FROM cycles WHERE id = ? AND user_id = ?',
  );
  const deleteStmt = db.prepare('DELETE FROM cycles WHERE id = ? AND user_id = ?');

  function validate(body, res) {
    const lastPeriodDate = String(body?.lastPeriodDate ?? '');
    const cycleLength = Number(body?.cycleLength);
    const periodLength = Number(body?.periodLength);

    if (!DATE_RE.test(lastPeriodDate)) {
      res.status(400).json({ error: '시작일 형식이 올바르지 않아요.' });
      return null;
    }
    if (!Number.isInteger(cycleLength) || cycleLength < 1 || cycleLength > 120) {
      res.status(400).json({ error: '주기는 1~120일 사이여야 해요.' });
      return null;
    }
    if (!Number.isInteger(periodLength) || periodLength < 1 || periodLength > 30) {
      res.status(400).json({ error: '생리 기간은 1~30일 사이여야 해요.' });
      return null;
    }
    return {
      lastPeriodDate,
      cycleLength,
      periodLength,
      savedAt: body?.savedAt ? String(body.savedAt) : new Date().toISOString(),
    };
  }

  router.get('/', (req, res) => {
    const rows = listStmt.all(req.user.id);
    return res.json({ records: rows.map(toEntry) });
  });

  router.put('/:id', (req, res) => {
    const id = String(req.params.id);
    if (!id) {
      return res.status(400).json({ error: '기록 id가 필요해요.' });
    }
    const v = validate(req.body, res);
    if (!v) return undefined;
    upsertStmt.run({ ...v, id, userId: req.user.id, now: new Date().toISOString() });
    return res.json({ record: toEntry(getStmt.get(id, req.user.id)) });
  });

  router.delete('/:id', (req, res) => {
    const info = deleteStmt.run(String(req.params.id), req.user.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: '기록을 찾을 수 없어요.' });
    }
    return res.status(204).end();
  });

  return router;
}