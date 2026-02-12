'use client'
import { useEffect, useState } from 'react'

type User = { id:number; tagId:string; name?:string; role:'admin'|'user'; points:number }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [tagId, setTagId] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin'|'user'>('user')
  const [msg, setMsg] = useState('')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [scanning, setScanning] = useState(false)

  const load = async () => {
    const r = await fetch('/api/admin/users')
    const d = await r.json()
    setUsers(d.users || [])
  }
  useEffect(()=>{ load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('')
    const r = await fetch('/api/admin/create-user', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tagId, name, role }) })
    if (!r.ok) { const d = await r.json().catch(()=>({error:'Fehler'})); setMsg(d.error || 'Fehler'); return }
    setTagId(''); setName(''); setRole('user'); load()
  }

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nutzer verwalten</h1>
        <p className="text-sm text-gray-600">Nur Admins können Benutzer anlegen.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Übersicht</h2>
        <button className="btn btn-primary" title="Öffnet ein Popup zum Anlegen eines Nutzers" onClick={()=>setShowCreateUser(true)}>
          Nutzer erstellen
        </button>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-3">Alle Nutzer</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map(u => (
            <div key={u.id} className="card p-3">
              <div className="font-medium"><span className="card-title">{u.name || '—'}</span> <span className="badge ml-2">{u.role}</span></div>
              <div className="text-sm text-gray-600">Tag: {u.tagId}</div>
              <div className="text-sm text-gray-600">Punkte: {u.points}</div>
            </div>
          ))}
        </div>
      </div>

      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowCreateUser(false)} />
          <div className="relative card w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nutzer erstellen</h3>
              <button className="btn btn-secondary" onClick={()=>setShowCreateUser(false)}>Schließen</button>
            </div>
            <form onSubmit={async (e)=>{ await create(e); setShowCreateUser(false) }} className="grid gap-3">
              <div>
                <label className="block text-sm">RFID Tag ID</label>
                <input className="input" value={tagId} onChange={e=>setTagId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Name</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Rolle</label>
                <select className="input" value={role} onChange={e=>setRole(e.target.value as any)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary">Erstellen</button>
              {msg && <div className="text-red-600 text-sm">{msg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
