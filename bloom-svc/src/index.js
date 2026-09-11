import express from 'express';
import cors from 'cors';
import { openDb } from './db.js';
import { authRouter, authenticate } from './auth.js';
import { cyclesRouter } from './cycles.js';

const PORT = Number(process.env.PORT || 3000);

const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const db = openDb();

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

app.use('/auth', authRouter(db));
app.get('/api/me', authenticate(db), (req, res) => {
  res.json({ user: req.user });
});
app.use('/api/cycles', authenticate(db), cyclesRouter(db));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '서버 오류가 발생했어요.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`bloom backend listening on 0.0.0.0:${PORT}`);
});