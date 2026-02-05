'use client'
import { useEffect, useState } from 'react'

type Assignment = { id:number; taskId:number; userId:number; status:string; taskTitle?:string; userName?:string }

function AdminAssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/assignments').catch(()=>null)
    if (!r) return
    const d = await r.json()
    setItems(d.assignments || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const act = async (id:number, action:'approve'|'reject') => {
    await fetch(`/api/assignments/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) })
    load()
  }

  return (
  <div className="container max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Abgaben</h1>
        <p className="text-sm text-gray-600">Prüfe eingereichte Aufgaben und bestätige oder lehne ab.</p>
      </div>

      {loading ? (
        <div className="text-gray-600">Lade…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">Keine Abgaben vorhanden.</div>
      ) : (
        <ul className="space-y-3">
          {items.map(a => (
            <li key={a.id} className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{a.taskTitle || `Aufgabe #${a.taskId}`} – {a.userName || `Nutzer #${a.userId}`}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Status:</span>
                  <span className={
                    a.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs' :
                    a.status === 'approved' ? 'bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs' :
                    a.status === 'assigned' ? 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs' :
                    'bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs'
                  }>{a.status === 'pending' ? '⏳ Eingereicht' : a.status === 'approved' ? '✓ Genehmigt' : a.status === 'assigned' ? 'Offen' : '✕ Abgelehnt'}</span>
              </div>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={()=>act(a.id,'approve')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md">Bestätigen</button>
                  <button onClick={()=>act(a.id,'reject')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md">Ablehnen</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminAssignmentsPage
