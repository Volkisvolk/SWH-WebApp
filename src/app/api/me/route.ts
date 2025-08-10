import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/auth'
import { getUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ user: null })
  const session = verifySession(token)
  if (!session) return NextResponse.json({ user: null })
  const user = await getUser(session.id)
  return NextResponse.json({ user })
}
