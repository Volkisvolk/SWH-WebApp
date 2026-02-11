import { NextRequest, NextResponse } from 'next/server'
import { findUserByRFID } from '@/lib/db'
import { signSession, COOKIE_NAME } from '@/lib/auth'

interface RfidEvent {
  uid?: string | null
  eventType?: string
  timestamp?: number
  color?: string | null
}

/**
 * POST /api/rfid/login
 * Verarbeitet RFID-Events vom Serial-Reader (Backend-Bridge auf Port 3002)
 * 
 * Unterstützte Events:
 * - LOGIN: Benutzer mit dieser UID einloggen (erste Karte ist gescannt)
 * - LOGOUT: Benutzer abmelden (Karte entfernt)
 * - STATUS: LED-Farben-Feedback (optional, für UI-Bestätigung)
 * 
 * Beispiel Arduino-Ausgabe:
 * - "Card UID: ABC123DEF456" → LOGIN
 * - "Card removed - User logged out" → LOGOUT
 * - "LED Color: Green" → STATUS
 */
export async function POST(req: NextRequest) {
  try {
    // Hole das neueste Event vom Serial-Reader (Backend-Bridge)
    const bridgeResponse = await fetch('http://localhost:3002/api/rfid/event', {
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

    const event: RfidEvent = await bridgeResponse.json()

    // LOGOUT-Event: Benutzer abmelden
    if (event.eventType === 'LOGOUT') {
      console.log('[RFID] LOGOUT-Event empfangen')
      const res = NextResponse.json({
        ok: true,
        eventType: 'LOGOUT',
        message: 'Benutzer abgemeldet',
        timestamp: event.timestamp
      })
      // Session-Cookie löschen
      res.cookies.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
      return res
    }

    // STATUS-Event: LED-Farben-Feedback (optional)
    if (event.eventType === 'STATUS') {
      console.log(`[RFID] STATUS-Event empfangen - LED-Farbe: ${event.color}`)
      return NextResponse.json({
        ok: true,
        eventType: 'STATUS',
        color: event.color,
        message: `LED-Rückmeldung: ${event.color}`,
        timestamp: event.timestamp
      })
    }

    // LOGIN-Event: Benutzer einloggen (default, falls eventType nicht gesetzt oder 'LOGIN')
    if (event.eventType !== 'LOGIN' && event.eventType !== undefined && event.eventType !== 'STATUS') {
      return NextResponse.json(
        { ok: false, error: `Unbekannter Event-Typ: ${event.eventType}` },
        { status: 400 }
      )
    }

    const uid = event.uid

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

    // Session erstellen mit Timestamp
    const token = signSession({ id: user.id, role: user.role })
    const res = NextResponse.json({
      ok: true,
      eventType: 'LOGIN',
      uid,
      user,
      timestamp: event.timestamp || Date.now()
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
