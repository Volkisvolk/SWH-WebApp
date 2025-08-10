import { NextRequest, NextResponse } from 'next/server'
import { createTask, listTasks } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

export async function GET() {
  const tasks = await listTasks()
  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { title?: string; points?: number; description?: string; tag?: string }
  if (!body?.title || typeof body.points !== 'number') {
    return NextResponse.json({ error: 'title and points required' }, { status: 400 })
  }
  const task = await createTask(body.title, body.points, body.description, body.tag)
  return NextResponse.json({ task })
}
