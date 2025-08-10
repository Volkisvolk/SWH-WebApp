import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { createStoreItem, deleteStoreItem, listStoreItems } from '@/lib/db'

export async function GET() {
  const items = await listStoreItems()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('beeapp_token')?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { title, cost, description } = await request.json()
  if (!title || !cost) return NextResponse.json({ error: 'missing' }, { status: 400 })
  const item = await createStoreItem(String(title), Number(cost), description ? String(description) : undefined)
  return NextResponse.json({ item })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('beeapp_token')?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id') || 0)
  if (!id) return NextResponse.json({ error: 'missing' }, { status: 400 })
  const ok = await deleteStoreItem(id)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
