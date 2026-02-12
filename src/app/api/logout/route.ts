import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  // Cache leeren, damit nicht sofort wieder eingeloggt wird
  await fetch('http://localhost:3002/api/rfid/uid', {
    method: 'DELETE'
  }).catch(() => {})
  
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
  return res
}
