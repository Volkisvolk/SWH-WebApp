'use client'
import { useEffect, useState } from 'react'

export default function AdminAssignPage() {
  const [users, setUsers] = useState<{id:number; tagId:string}[]>([])
  const [tasks, setTasks] = useState<{id:number; title:string}[]>([])
  const [userId, setUserId] = useState<number|''>('')
  const [taskId, setTaskId] = useState<number|''>('')

  useEffect(() => {
    (async () => {
      const u = await fetch('/api/admin/users').then(r=>r.json())
      const t = await fetch('/api/tasks').then(r=>r.json())
      setUsers(u.users||[]); setTasks(t.tasks||[])
    })()
  }, [])

  const assign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !taskId) return
    await fetch('/api/assign', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, taskId }) })
    alert('Zugewiesen')
  }

  return (
    <div className="container space-y-4">
      <h1 className="text-xl font-semibold">Aufgabe zuweisen</h1>
      <form onSubmit={assign} className="card p-4 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Nutzer</label>
          <select className="input" value={userId} onChange={e=>setUserId(Number(e.target.value))}>
            <option value="">-- wählen --</option>
            {users.map(u => (<option key={u.id} value={u.id}>{u.tagId}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Aufgabe</label>
          <select className="input" value={taskId} onChange={e=>setTaskId(Number(e.target.value))}>
            <option value="">-- wählen --</option>
            {tasks.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
          </select>
        </div>
  <button className="btn btn-primary">Zuweisen</button>
      </form>
    </div>
  )
}
