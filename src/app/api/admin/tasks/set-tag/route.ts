import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { listTags, setTaskTag } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>null) as { taskId?: number; tagId?: number|null }
  if (!body?.taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
  // validate tagId if provided
  if (body.tagId) {
    const tags = await listTags()
    const exists = tags.some(t=>t.id === body.tagId)
    if (!exists) return NextResponse.json({ error: 'tag not found' }, { status: 404 })
  }
  const updated = await setTaskTag(body.taskId, body.tagId ?? undefined)
  if (!updated) return NextResponse.json({ error: 'task not found' }, { status: 404 })
  return NextResponse.json({ task: updated })
}
