import jwt from 'jsonwebtoken';

export type TokenPayload = {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function verifyToken(token?: string | null): TokenPayload | null {
  if (!token) return null;
  // Accept `Bearer <token>` or raw token
  const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  try {
    const payload = jwt.verify(raw, JWT_SECRET) as TokenPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

// Express middleware example
export function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  const token = auth && auth.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Unauthorized' });
  req.user = payload;
  next();
}
