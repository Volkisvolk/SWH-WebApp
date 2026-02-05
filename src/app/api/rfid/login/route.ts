import { NextRequest, NextResponse } from 'next/server'
import { findUserByRFID } from '@/lib/db'
import { signSession, COOKIE_NAME } from '@/lib/auth'

/**
 * POST /api/rfid/login
 * Login mit RFID-UID, die vom Serial-Reader in den Cache geschrieben wurde
 * 
 * Der Serial-Reader (server/src/index.js) läuft auf Port 3002
 * und stellt die letzte gescannte UID unter /api/rfid/latest zur Verfügung
 */
export async function POST(req: NextRequest) {
  try {
    // Hole die neueste UID vom Serial-Reader (Backend-Bridge)
    const bridgeResponse = await fetch('http://localhost:3002/api/rfid/latest', {
      method: 'GET',
      cache: 'no-store'
    }).catch(err => {
      console.error('[RFID] Fehler beim Abrufen von Bridge:', err.message)
      return null
    })

    if (!bridgeResponse || !bridgeResponse.ok) {
      return NextResponse.json(
        { ok: false, error: 'Serial-Reader nicht erreichbar. Stelle sicher, dass der Server mit "npm start" im /server Ordner läuft.' },
        { status: 503 }
      )
    }

    const data = await bridgeResponse.json() as { uid?: string | null }
    const uid = data?.uid

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'Keine RFID-Karte gescannt. Bitte Karte scannen.' },
        { status: 400 }
      )
    }

    // Suche User mit dieser RFID-UID
    const user = await findUserByRFID(uid)
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'RFID-Karte ist nicht registriert.', uid },
        { status: 403 }
      )
    }

    // Session erstellen
    const token = signSession({ id: user.id, role: user.role })
    const res = NextResponse.json({ ok: true, uid, user })
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/' })
    return res
  } catch (err) {
    console.error('[RFID] Login-Fehler:', err)
    return NextResponse.json(
      { ok: false, error: 'Interner Fehler' },
      { status: 500 }
    )
  }
}
