import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { adjustUserPoints } from '@/lib/db'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null) as { points?: number }
  const points = Number(body?.points)
  if (!points || points <= 0) return NextResponse.json({ error: 'invalid points' }, { status: 400 })
  const user = await adjustUserPoints(session.id, -points)
  if (!user) return NextResponse.json({ error: 'not enough points' }, { status: 400 })
  return NextResponse.json({ user })
}
