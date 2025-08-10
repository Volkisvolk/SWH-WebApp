"use client"
import { useState } from 'react'
import { useEffect } from 'react'

export default function Home() {
  const [tagId, setTagId] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/me').catch(()=>null)
      const d = r ? await r.json() : {}
      if (d.user) window.location.href = '/dashboard'
    })()
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const r = await fetch('/api/rfid-login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ tagId }) })
    if (!r.ok) { setMsg('Login fehlgeschlagen'); return }
    const d = await r.json()
  if (d?.needsAdminCreation) { setMsg('Unbekannte Karte. Bitte Admin kontaktieren.'); return }
    // redirect based on role
    const role = d.user?.role
    location.href = role === 'admin' ? '/admin' : '/dashboard'
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={login} className="card p-6 space-y-3 w-full max-w-sm">
        <h1 className="text-xl font-semibold">RFID Login</h1>
        <p className="text-sm text-gray-600">Halte deinen RFID-Chip am Scanner. Fürs Debuggen kannst du die Tag-ID manuell eingeben.</p>
        <input className="input w-full" placeholder="RFID Tag ID" value={tagId} onChange={e=>setTagId(e.target.value)} />
  <button className="btn btn-primary w-full">Einloggen</button>
        {msg && <div className="text-red-600 text-sm">{msg}</div>}
      </form>
    </div>
  )
}
