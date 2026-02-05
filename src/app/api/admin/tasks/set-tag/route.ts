import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { listTags, setTaskTags } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? verifySession(token) : null
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const body = await req.json().catch(()=>null) as { taskId?: number; tagIds?: number[]|null }
    console.log('[set-tag] Received:', body)
    if (!body?.taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    // validate tagIds if provided
    if (body.tagIds && body.tagIds.length > 0) {
      const tags = await listTags()
      const allValid = body.tagIds.every(tagId => tags.some(t => t.id === tagId))
      console.log('[set-tag] Validating tagIds:', body.tagIds, 'allValid:', allValid)
      if (!allValid) return NextResponse.json({ error: 'one or more tags not found' }, { status: 404 })
    }
    const updated = await setTaskTags(body.taskId, body.tagIds ?? undefined)
    console.log('[set-tag] Updated task:', updated)
    if (!updated) return NextResponse.json({ error: 'task not found' }, { status: 404 })
    return NextResponse.json({ task: updated })
  } catch (e) {
    console.error('[set-tag] Error:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
