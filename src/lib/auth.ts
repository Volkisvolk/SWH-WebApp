import jwt from 'jsonwebtoken'

export interface Session {
  id: number
  role: 'admin' | 'user'
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function signSession(session: Session) {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' })
}

export function verifySession(token: string): Session | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Session
  } catch {
    return null
  }
}

export const COOKIE_NAME = 'beeapp_token'
