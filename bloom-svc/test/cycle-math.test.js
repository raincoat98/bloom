const test = require('node:test');
const assert = require('node:assert');
const { evaluateCycle, formatUtcDate, parseUtcDate } = require('../dist/push/cycle-math');

test('cycle-math evaluation for push notifications', async (t) => {
  await t.test('correctly calculates 2 days before next period start', () => {
    const result = evaluateCycle('2026-10-01', 28, '2026-10-27');
    assert.strictEqual(result.nextPeriodStart, '2026-10-29');
    assert.strictEqual(result.daysUntilNextPeriod, 2);
  });

  await t.test('correctly calculates 1 day before fertile window starts', () => {
    const result = evaluateCycle('2026-10-01', 28, '2026-10-09');
    assert.strictEqual(result.fertileWindowStart, '2026-10-10');
    assert.strictEqual(result.daysUntilFertileWindow, 1);
  });

  await t.test('handles multiple cycles elapsed', () => {
    const result = evaluateCycle('2026-08-01', 30, '2026-09-28');
    assert.strictEqual(result.nextPeriodStart, '2026-09-30');
    assert.strictEqual(result.daysUntilNextPeriod, 2);
  });

  await t.test('parses and formats UTC dates deterministically', () => {
    const date = parseUtcDate('2026-12-25');
    assert.strictEqual(date.getUTCFullYear(), 2026);
    assert.strictEqual(date.getUTCMonth(), 11);
    assert.strictEqual(date.getUTCDate(), 25);
    assert.strictEqual(formatUtcDate(date), '2026-12-25');
  });
});
