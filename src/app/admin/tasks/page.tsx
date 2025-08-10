"use client"
import { useEffect, useState } from 'react'

export default function AdminTasksPage() {
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [tasks, setTasks] = useState<{id:number; title:string; points:number; description?:string; tag?:string}[]>([])

  const load = async () => {
    const r = await fetch('/api/tasks')
    const d = await r.json()
    setTasks(d.tasks || [])
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ title, points, description, tag })})
    setTitle('')
    setPoints(10)
    setDescription('')
    setTag('')
    load()
  }

  return (
    <div className="container space-y-4">
      <h1 className="text-xl font-semibold">Aufgaben</h1>
      <form onSubmit={create} className="card p-4 grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-sm">Titel</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Punkte</label>
          <input type="number" className="input w-24" value={points} onChange={e=>setPoints(parseInt(e.target.value||'0'))} />
        </div>
        <div>
          <label className="block text-sm">Beschreibung</label>
          <input className="input" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Tag</label>
          <input className="input" value={tag} onChange={e=>setTag(e.target.value)} />
        </div>
        <button className="btn btn-primary md:col-span-4">Erstellen</button>
      </form>

      <div className="card p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map(t => (
            <div key={t.id} className="border rounded p-3">
              <div className="font-medium flex items-center justify-between">
                <span>{t.title}</span>
                {t.tag && <span className="badge">{t.tag}</span>}
              </div>
              {t.description && <div className="text-sm mt-1">{t.description}</div>}
              <div className="text-sm text-gray-600 mt-2">{t.points} Punkte</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
