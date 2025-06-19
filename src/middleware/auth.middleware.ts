import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token required' });

  const userData = verifyToken(token);
  if (!userData) return res.status(403).json({ message: 'Invalid or expired token' });

  req.user = {
    id: userData.id,
    email: userData.email
  };

  next();
}
