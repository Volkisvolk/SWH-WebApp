import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redeemStoreItem } from '@/lib/db'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('beeapp_token')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { itemId } = await request.json()
  const res = await redeemStoreItem(session.id, Number(itemId))
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
  return NextResponse.json({ ok: true, user: res.user, item: res.item })
}
