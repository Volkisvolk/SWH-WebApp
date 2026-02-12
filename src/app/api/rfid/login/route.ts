import { NextRequest, NextResponse } from 'next/server'
import { findUserByRFID } from '@/lib/db'
import { signSession, COOKIE_NAME } from '@/lib/auth'

/**
 * POST /api/rfid/login
 * Einfacher RFID-Login: Liest UID vom Serial-Reader und loggt bekannte User ein
 */
export async function POST(req: NextRequest) {
  try {
    // Hole die neueste UID vom Serial-Reader (Backend-Bridge auf Port 3002)
    const bridgeResponse = await fetch('http://localhost:3002/api/rfid/uid', {
      method: 'GET',
      cache: 'no-store'
    }).catch(err => {
      console.error('[RFID] Fehler beim Abrufen von Bridge:', err.message)
      return null
    })

    if (!bridgeResponse || !bridgeResponse.ok) {
      return NextResponse.json(
        { ok: false, error: 'Serial-Reader nicht erreichbar. Stelle sicher, dass der Server läuft: cd server && node src/index.js COM4' },
        { status: 503 }
      )
    }

    const data = await bridgeResponse.json()
    const uid = data.uid

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: 'Keine Karte gescannt' },
        { status: 400 }
      )
    }

    // Suche User mit dieser RFID-UID
    const user = await findUserByRFID(uid)
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'RFID-Karte ist nicht registriert', uid },
        { status: 403 }
      )
    }

    // Session erstellen und User einloggen
    const token = signSession({ id: user.id, role: user.role })
    
    // Cache leeren, damit nach Logout nicht sofort wieder eingeloggt wird
    await fetch('http://localhost:3002/api/rfid/uid', {
      method: 'DELETE'
    }).catch(() => {})
    
    const res = NextResponse.json({
      ok: true,
      user,
      uid
    })
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
