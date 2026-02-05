import { NextRequest, NextResponse } from 'next/server'
import { createTask, listTasks, updateTask, deleteTask } from '@/lib/db'
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

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { id?: number; title?: string; points?: number; description?: string; tagId?: number | null }
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const task = await updateTask(body.id, { title: body.title, points: body.points, description: body.description, tagId: body.tagId ?? null })
  if (!task) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id || isNaN(Number(id))) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const result = await deleteTask(Number(id))
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
