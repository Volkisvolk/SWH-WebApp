'use client'
import { useEffect, useState } from 'react'

type User = { id:number; role:'admin'|'user'; points:number; tagId:string; name?:string }

type Assignment = { id:number; taskId:number; userId:number; status:string; taskTitle?:string; taskPoints?:number; description?:string; tag?:string }
type StoreItem = { id:number; title:string; cost:number; description?:string }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [redeemPoints, setRedeemPoints] = useState<number|''>('')
  const [items, setItems] = useState<StoreItem[]>([])
  const [notice, setNotice] = useState<{ type: 'success'|'error'; text: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const r = await fetch('/api/me', { cache: 'no-store' })
      const d = await r.json()
      if (d.user?.role === 'admin') {
        window.location.href = '/admin/workspace'
        return
      }
      setUser(d.user || null)
      if (d.user) {
        const r2 = await fetch('/api/user/assignments', { cache: 'no-store' }).catch(()=>null)
        const d2 = r2 ? await r2.json() : { assignments: [] }
        setAssignments(d2.assignments || [])
        const r3 = await fetch('/api/store', { cache: 'no-store' }).catch(()=>null)
        const d3 = r3 ? await r3.json() : { items: [] }
        setItems(d3.items || [])
      }
    }
    load()
  }, [])

  if (!user) return <div className="container">Bitte einloggen…</div>

  return (
    <div className="container space-y-5">
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold">Hallo {user.name || user.tagId}</h1>
            <div className="mt-1">Punkte: <span className="font-semibold">{user.points}</span></div>
          </div>
        </div>
        <form onSubmit={async(e)=>{
          e.preventDefault();
          if(!redeemPoints) return;
          const r = await fetch('/api/redeem',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ points: redeemPoints })})
          if (r.ok) {
            setUser(u => u ? { ...u, points: Math.max(0, u.points - Number(redeemPoints)) } : u)
            setRedeemPoints('')
            setNotice({ type: 'success', text: 'Punkte eingelöst.' })
          } else {
            const d = await r.json().catch(()=>({ error: 'Fehler beim Einlösen' }))
            setNotice({ type: 'error', text: d.error || 'Fehler beim Einlösen' })
          }
        }} className="mt-4 flex items-end gap-2">
          <div>
            <label className="block text-sm">Punkte einlösen</label>
            <input type="number" className="input w-32" value={redeemPoints} onChange={e=>setRedeemPoints(parseInt(e.target.value||'0'))} />
          </div>
          <button className="btn btn-primary">Einlösen</button>
        </form>
        {notice && (
          <div className={`mt-3 text-sm px-3 py-2 rounded border ${notice.type==='success' ? 'border-green-600 text-green-400' : 'border-red-600 text-red-400'}`}>
            <div className="flex items-center justify-between gap-3">
              <span>{notice.text}</span>
              <button className="text-current" onClick={()=>setNotice(null)}>✕</button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold">Deine Aufgaben</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {assignments.filter(a=>a.status==='assigned' || a.status==='pending').map(a => (
            <div key={a.id} className="border rounded p-3">
              <div className="font-medium flex items-center justify-between">
                <span>{a.taskTitle || `Task #${a.taskId}`}</span>
                {a.tag && <span className="badge">{a.tag}</span>}
              </div>
              {a.description && <div className="text-sm mt-1">{a.description}</div>}
              <div className="text-sm text-gray-600 mt-2">{a.taskPoints ?? 0} Punkte</div>
              <div className="mt-3">
                {a.status === 'assigned' ? (
                  <button onClick={async()=>{await fetch(`/api/assignments/${a.id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'complete' })}); location.reload()}} className="btn btn-primary w-full">Abschließen</button>
                ) : (
                  <span className="text-sm text-gray-600">Status: {a.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Store</h2>
          <div className="text-sm text-gray-600">Deine Punkte: <span className="font-semibold">{user.points}</span></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {items.map(it => (
            <div key={it.id} className="border rounded p-3 space-y-2">
              <div className="font-medium flex items-center justify-between">
                <span className="break-words">{it.title}</span>
                <span className="badge">{it.cost} Punkte</span>
              </div>
              {it.description && <div className="text-sm text-gray-600 break-words">{it.description}</div>}
              <button
                disabled={user.points < it.cost}
                onClick={async()=>{
                  const r = await fetch('/api/store/redeem', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itemId: it.id }) })
                  if (r.ok) {
                    const d = await r.json().catch(()=>null)
                    const updatedPoints = d?.user?.points as number | undefined
                    if (typeof updatedPoints === 'number') setUser(u => u ? { ...u, points: updatedPoints } : u)
                    setNotice({ type: 'success', text: `"${it.title}" eingelöst.` })
                  } else {
                    const d = await r.json().catch(()=>({ error: 'Fehler' }))
                    setNotice({ type: 'error', text: d.error || 'Fehler' })
                  }
                }}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                title={user.points < it.cost ? 'Zu wenig Punkte' : 'Einlösen'}
              >
                Einlösen
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold">Historie</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {assignments.filter(a=>a.status==='approved' || a.status==='rejected').map(a => (
            <div key={a.id} className="border rounded p-3">
              <div className="font-medium flex items-center justify-between">
                <span>{a.taskTitle || `Task #${a.taskId}`}</span>
                {a.tag && <span className="badge">{a.tag}</span>}
              </div>
              {a.description && <div className="text-sm mt-1">{a.description}</div>}
              <div className="text-sm text-gray-600 mt-2">{a.taskPoints ?? 0} Punkte</div>
              <div className="mt-2 text-sm">Status: {a.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
