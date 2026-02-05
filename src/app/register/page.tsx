"use client"
import { useEffect, useState } from 'react'
import RfidLoginButton from '@/components/RfidLoginButton'

export default function RegisterPage() {
  const [tagId, setTagId] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const t = url.searchParams.get('tagId') || ''
    setTagId(t)
  }, [])

  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!tagId || !name) { setMsg('Bitte Tag-ID und Namen angeben.'); return }
    const r = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tagId, name }) })
    const d = await r.json()
    if (!r.ok) { setMsg(d.error || 'Registrierung fehlgeschlagen'); return }
    setMsg('Registrierung erfolgreich. Du kannst dich jetzt einloggen.')
  }

  const quickLogin = async () => {
    const r = await fetch('/api/rfid-login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tagId }) })
    const d = await r.json()
    if (d?.needsRegistration) { setMsg('Bitte zuerst registrieren.'); return }
    const role = d.user?.role
    location.href = role === 'admin' ? '/admin' : '/dashboard'
  }

  const handleRfidScanForTag = async () => {
    setScanning(true)
    setMsg('Scanning... Bitte Karte scannen...')

    try {
      // Polling für neue UID
      let attempts = 0
      const maxAttempts = 30

      const pollForTag = async () => {
        attempts++
        if (attempts > maxAttempts) {
          setScanning(false)
          setMsg('')
          setMsg('Timeout: Keine Karte gescannt.')
          return
        }

        try {
          const response = await fetch('http://localhost:3002/api/rfid/latest', {
            cache: 'no-store'
          })
          const data = await response.json() as { uid?: string | null }
          
          if (data?.uid) {
            setTagId(data.uid)
            setMsg(`✓ UID gescannt: ${data.uid}`)
            setScanning(false)
          } else {
            setTimeout(pollForTag, 1000)
          }
        } catch (err) {
          console.error('Poll error:', err)
          setMsg('Fehler beim Abrufen der UID. Stelle sicher, dass der Serial-Reader läuft.')
          setScanning(false)
        }
      }

      await pollForTag()
    } catch (err) {
      setScanning(false)
      setMsg('Fehler beim Scan-Vorgang')
    }
  }

  const handleCancel = () => {
    setScanning(false)
    setMsg('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={register} className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold">Registrieren</h1>
        <div>
          <label className="block text-sm">RFID Tag ID</label>
          <div className="flex gap-2">
            <input className="input w-full" value={tagId} onChange={e=>setTagId(e.target.value)} placeholder="z. B. ABC123" />
            {scanning ? (
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Abbrechen
              </button>
            ) : (
              <button type="button" onClick={handleRfidScanForTag} className="btn btn-secondary">
                📱 Scannen
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm">Name</label>
          <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="Dein Name" />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">Registrieren</button>
          <button className="btn" type="button" onClick={quickLogin}>Einloggen</button>
        </div>
        {msg && <div className="text-sm text-gray-700">{msg}</div>}
      </form>
    </div>
  )
}
