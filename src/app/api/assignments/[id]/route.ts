import { NextRequest, NextResponse } from 'next/server'
import { approveAssignment, setAssignmentStatus, listAllAssignments } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const body = await req.json().catch(() => null) as { action?: 'complete' | 'approve' | 'reject' }
  if (!id || !body?.action) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (body.action === 'complete') {
    // ensure the assignment belongs to the user
    const all = await listAllAssignments()
    const a0 = all.find(a => a.id === id)
    if (!a0 || a0.userId !== session.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const a = await setAssignmentStatus(id, 'pending')
    if (!a) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ assignment: a })
  }
  if (body.action === 'approve') {
    if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const res = await approveAssignment(id)
    if (!res) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(res)
  }
  if (body.action === 'reject') {
    if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    const a = await setAssignmentStatus(id, 'rejected')
    if (!a) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ assignment: a })
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
