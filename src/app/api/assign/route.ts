import { NextRequest, NextResponse } from 'next/server'
import { assignTask } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { userId?: number; taskId?: number }
  if (!body?.userId || !body?.taskId) return NextResponse.json({ error: 'userId and taskId required' }, { status: 400 })
  const a = await assignTask(Number(body.taskId), Number(body.userId))
  return NextResponse.json({ assignment: a })
}
