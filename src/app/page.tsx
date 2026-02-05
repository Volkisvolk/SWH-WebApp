"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [tagId, setTagId] = useState('')
  const [msg, setMsg] = useState('')
  const [scanning, setScanning] = useState(true)
  const [manualMode, setManualMode] = useState(false)

  // Auto-Scan beim Laden starten
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/me').catch(()=>null)
      const d = r ? await r.json() : {}
      if (d.user) window.location.href = '/dashboard'
    })()
    
    startAutoScan()
  }, [])

  const startAutoScan = async () => {
    setScanning(true)
    setMsg('Waiting... Halte deine Karte an den Scanner')

    try {
      let attempts = 0
      const maxAttempts = 300 // 5 Minuten Timeout

      const pollForLogin = async () => {
        attempts++
        if (attempts > maxAttempts) {
          setScanning(false)
          setMsg('Timeout nach 5 Minuten')
          return
        }

        try {
          const response = await fetch('/api/rfid/login', {
            method: 'POST'
          })

          const data = await response.json()

          if (data.ok && data.user) {
            setScanning(false)
            setMsg(`✓ Login erfolgreich: ${data.user.name || `User ${data.user.id}`}`)
            // Redirect nach 1 Sekunde
            setTimeout(() => {
              const dest = data.user.role === 'admin' ? '/admin' : '/dashboard'
              router.push(dest)
            }, 1000)
          } else if (data.error) {
            if (!data.error.includes('gescannt')) {
              setMsg(data.error)
            }
            // Versuche erneut
            setTimeout(pollForLogin, 1000)
          } else {
            setTimeout(pollForLogin, 1000)
          }
        } catch (err) {
          console.error('RFID poll error:', err)
          setTimeout(pollForLogin, 1000)
        }
      }

      await pollForLogin()
    } catch (err) {
      setScanning(false)
      console.error('RFID error:', err)
      setMsg('Fehler beim Auto-Scan')
    }
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!tagId) { setMsg('Bitte Tag-ID eingeben'); return }
    const r = await fetch('/api/rfid-login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ tagId }) })
    if (!r.ok) { setMsg('Login fehlgeschlagen'); return }
    const d = await r.json()
    if (d?.needsAdminCreation) { setMsg('Unbekannte Karte. Bitte Admin kontaktieren.'); return }
    const role = d.user?.role
    location.href = role === 'admin' ? '/admin' : '/dashboard'
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="card p-6 space-y-4 w-full max-w-sm">
        <h1 className="text-xl font-semibold">🐝 RFID Login</h1>
        
        {/* Auto-Scanning */}
        {scanning && (
          <div className="space-y-3 text-center">
            <div className="spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p className="text-gray-600 font-medium">{msg}</p>
            <button
              onClick={() => setScanning(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Manuell einloggen stattdessen
            </button>
          </div>
        )}

        {/* Manual Input */}
        {!scanning && (
          <form onSubmit={handleManualLogin} className="space-y-3">
            <input
              className="input w-full"
              placeholder="RFID Tag ID"
              value={tagId}
              onChange={e => setTagId(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" type="submit">Einloggen</button>
              <button 
                className="btn flex-1" 
                type="button"
                onClick={startAutoScan}
              >
                Zurück zu Auto-Scan
              </button>
            </div>
            {msg && <div className="text-red-600 text-sm">{msg}</div>}
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Neu hier? <a href="/register" className="text-blue-500 hover:text-blue-700 underline">Jetzt registrieren</a></p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
