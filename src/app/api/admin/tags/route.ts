import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { createTag, deleteTag, listTags } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const tags = await listTags()
  return NextResponse.json({ tags })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>null) as { name?: string; color?: string }
  if (!body?.name || !body?.color) return NextResponse.json({ error: 'name and color required' }, { status: 400 })
  const tag = await createTag(body.name, body.color)
  return NextResponse.json({ tag })
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const tagId = Number(searchParams.get('tagId') || '')
  if (!tagId) return NextResponse.json({ error: 'tagId required' }, { status: 400 })
  const ok = await deleteTag(tagId)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
