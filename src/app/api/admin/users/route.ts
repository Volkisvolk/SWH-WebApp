import { NextRequest, NextResponse } from 'next/server'
import { deleteUser, listUsers, updateUserRole } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const users = await listUsers()
  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>null) as { userId?: number; role?: 'admin'|'user' }
  if (!body?.userId || !body.role) return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
  const user = await updateUserRole(body.userId, body.role)
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get('userId') || '')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const ok = await deleteUser(userId)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
