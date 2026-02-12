'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name?: string
  role: string
  points: number
}

interface RFIDCard {
  uid: string
  userId: number
  registeredAt: string
}

export default function AdminRfidPage() {
  const router = useRouter()
  const [cards, setCards] = useState<RFIDCard[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [newUid, setNewUid] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    loadCards()
    loadUsers()
  }, [])

  const loadCards = async () => {
    try {
      const res = await fetch('/api/rfid/cards')
      if (!res.ok) throw new Error('Failed to load cards')
      const data = await res.json()
      setCards(data.cards || [])
    } catch (err) {
      setError('Fehler beim Laden der Karten')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Fehler beim Laden der User:', err)
    }
  }

  const handleScanForUid = async () => {
    setScanning(true)
    setMessage('Scanning... Bitte Karte scannen...')
    setError('')

    try {
      let attempts = 0
      const maxAttempts = 30

      const poll = async () => {
        attempts++
        if (attempts > maxAttempts) {
          setScanning(false)
          setMessage('')
          setError('Timeout: Keine Karte gescannt.')
          return
        }

        try {
          const response = await fetch('http://localhost:3002/api/rfid/uid', {
            cache: 'no-store'
          })
          const data = await response.json() as { uid?: string | null }
          
          if (data?.uid) {
            setNewUid(data.uid)
            setMessage(`✓ UID gescannt: ${data.uid}`)
            setScanning(false)
          } else {
            setTimeout(poll, 1000)
          }
        } catch (err) {
          console.error('Poll error:', err)
          setError('Fehler beim Abrufen der UID')
          setScanning(false)
        }
      }

      await poll()
    } catch (err) {
      setScanning(false)
      setError('Fehler beim Scan-Vorgang')
    }
  }

  const handleRegisterCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!newUid.trim() || !selectedUserId) {
      setError('Bitte UID und User auswählen')
      return
    }

    try {
      const res = await fetch('/api/rfid/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: newUid.trim().toUpperCase(), userId: Number(selectedUserId) })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      setMessage('✓ Karte erfolgreich registriert')
      setNewUid('')
      setSelectedUserId('')
      await loadCards()
    } catch (err) {
      setError('Fehler beim Registrieren')
      console.error(err)
    }
  }

  const handleDeleteCard = async (uid: string) => {
    if (!confirm(`Karte ${uid} wirklich löschen?`)) return

    try {
      const res = await fetch(`/api/rfid/cards?uid=${encodeURIComponent(uid)}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        setError('Fehler beim Löschen')
        return
      }

      setMessage('✓ Karte gelöscht')
      await loadCards()
    } catch (err) {
      setError('Fehler beim Löschen')
      console.error(err)
    }
  }

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId)
    return user?.name || `User ${userId}`
  }

  if (loading) {
    return <div className="p-6">Lädt...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              <span className="font-semibold text-lg">BeeApp</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/admin/workspace"
                style={{
                  color: '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Aufgaben
              </a>
              <a
                href="/admin/workspace"
                style={{
                  color: '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Abgaben
              </a>
              <a
                href="/admin/workspace"
                style={{
                  color: '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Nutzer
              </a>
              <a
                href="/admin/workspace"
                style={{
                  color: '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Store
              </a>
              <a
                href="/admin/rfid"
                style={{
                  backgroundColor: '#f6c453',
                  color: '#1a1a1a',
                }}
                className="px-4 py-2 rounded transition-all font-medium"
              >
                RFID
              </a>
            </div>
            <button onClick={async()=>{ await fetch('/api/logout',{ method:'POST' }); window.location.href='/' }} className="btn btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">

      {/* Register New Card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Neue Karte registrieren</h2>
        <form onSubmit={handleRegisterCard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">RFID UID</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
                placeholder="z.B. ABC123 oder scannen"
              />
              <button
                type="button"
                onClick={handleScanForUid}
                disabled={scanning}
                className="btn btn-secondary"
              >
                {scanning ? 'Scanning...' : '📱 Scannen'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">User zuweisen</label>
            <select
              className="input w-full"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- User auswählen --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || `User ${user.id}`} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Registrieren
          </button>
        </form>

        {message && <div className="text-green-600 font-medium">{message}</div>}
        {error && <div className="text-red-600 font-medium">{error}</div>}
      </div>

      {/* List of Cards */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Registrierte Karten ({cards.length})</h2>
        {cards.length === 0 ? (
          <p className="text-gray-500">Keine Karten registriert</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">UID</th>
                  <th className="border border-gray-300 p-2 text-left">User</th>
                  <th className="border border-gray-300 p-2 text-left">Registriert am</th>
                  <th className="border border-gray-300 p-2 text-center">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.uid} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-mono text-sm">{card.uid}</td>
                    <td className="border border-gray-300 p-2">{getUserName(card.userId)}</td>
                    <td className="border border-gray-300 p-2 text-sm">
                      {new Date(card.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleDeleteCard(card.uid)}
                        className="btn btn-sm btn-danger"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }
        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }
        .btn-danger:hover {
          background-color: #c0392b;
        }
      `}</style>
        </div>
      </main>
    </div>
  )
}
