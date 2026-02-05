import { NextRequest, NextResponse } from 'next/server'
import { listRFIDCards, getRFIDCardsForUser, registerRFIDCard, unregisterRFIDCard, getUser } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

/**
 * GET /api/rfid/cards - Alle RFID-Karten auflisten (Admin-nur)
 * GET /api/rfid/cards?userId=123 - RFID-Karten für einen User
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userIdParam = searchParams.get('userId')

  if (userIdParam) {
    const userId = Number(userIdParam)
    if (isNaN(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    const cards = await getRFIDCardsForUser(userId)
    return NextResponse.json({ cards })
  }

  // Nur Admin kann alle Karten sehen
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cards = await listRFIDCards()
  return NextResponse.json({ cards })
}

/**
 * POST /api/rfid/cards - Neue RFID-Karte registrieren
 * Body: { uid: "ABC123", userId: 1 }
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden (Admin-only)' }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { uid?: string; userId?: number }
  if (!body?.uid || !body?.userId) {
    return NextResponse.json({ error: 'uid and userId required' }, { status: 400 })
  }

  const uid = body.uid.trim().toUpperCase()
  const user = await getUser(body.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const card = await registerRFIDCard(uid, body.userId)
  if (!card) {
    return NextResponse.json({ error: 'Card UID already registered' }, { status: 409 })
  }

  return NextResponse.json({ card })
}

/**
 * DELETE /api/rfid/cards?uid=ABC123 - RFID-Karte löschen (Admin-only)
 */
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden (Admin-only)' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')
  if (!uid) {
    return NextResponse.json({ error: 'uid required' }, { status: 400 })
  }

  const success = await unregisterRFIDCard(uid.trim().toUpperCase())
  if (!success) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
