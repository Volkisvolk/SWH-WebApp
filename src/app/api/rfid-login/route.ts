import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateUserByTag, seedAdminIfEmpty, findUserByTag } from '@/lib/db'
import { signSession, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { tagId?: string }
  if (!body?.tagId) return NextResponse.json({ error: 'tagId required' }, { status: 400 })

  await seedAdminIfEmpty(process.env.ADMIN_TAG)
  const existing = await findUserByTag(body.tagId)
  if (!existing) {
    return NextResponse.json({ needsAdminCreation: true, tagId: body.tagId })
  }
  const user = existing
  const token = signSession({ id: user.id, role: user.role })
  const res = NextResponse.json({ ok: true, user })
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tagId = searchParams.get('tagId')
  if (!tagId) return NextResponse.json({ error: 'tagId required' }, { status: 400 })
  await seedAdminIfEmpty(process.env.ADMIN_TAG)
  const existing = await findUserByTag(tagId)
  if (!existing) {
    // Unknown tag: no auto-registration. Stay on page; client can show message.
    return NextResponse.json({ needsAdminCreation: true, tagId })
  }
  const user = existing
  const token = signSession({ id: user.id, role: user.role })
  const dest = user.role === 'admin' ? '/admin' : '/dashboard'
  const res = NextResponse.redirect(new URL(dest, req.url))
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}
