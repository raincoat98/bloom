import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'bloom-dev-secret-change-me';
const JWT_EXPIRES = '90d';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function publicUser(row) {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}

export function authRouter(db) {
  const router = Router();

  router.post('/signup', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: '올바른 이메일 주소를 입력해 주세요.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 해요.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: '이미 가입된 이메일이에요. 로그인해 주세요.' });
    }

    const id = randomUUID();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
    ).run(id, email, hash, new Date().toISOString());

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return res.status(201).json({ token: createToken(id), user: publicUser(user) });
  });

  router.post('/login', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' });
    }

    return res.json({ token: createToken(user.id), user: publicUser(user) });
  });

  return router;
}

export function authenticate(db) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: '로그인이 필요해요.' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db
        .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
        .get(payload.sub);
      if (!user) {
        return res.status(401).json({ error: '계정을 찾을 수 없어요.' });
      }
      req.user = publicUser(user);
      return next();
    } catch {
      return res.status(401).json({ error: '로그인이 만료됐어요. 다시 로그인해 주세요.' });
    }
  };
}