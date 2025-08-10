import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { createUser, findUserByTag } from '@/lib/db'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { tagId?: string; name?: string; role?: 'admin'|'user' }
  if (!body?.tagId || !body?.name) return NextResponse.json({ error: 'tagId and name required' }, { status: 400 })
  const exists = await findUserByTag(body.tagId)
  if (exists) return NextResponse.json({ error: 'tag already registered' }, { status: 409 })
  const user = await createUser(body.tagId, body.name, body.role || 'user')
  return NextResponse.json({ user })
}
