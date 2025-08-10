"use client"
import { useEffect, useMemo, useState } from 'react'

type Task = { id:number; title:string; points:number; description?:string; tag?:string; tagId?: number }

type Assignment = { id:number; taskId:number; userId:number; status:string; taskTitle?:string; userName?:string }
type StoreItem = { id:number; title:string; cost:number; description?:string }
type User = { id:number; tagId:string; name?:string; role?: 'admin'|'user'; points?: number }

export default function AdminWorkspace() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<{id:number; name:string; color:string}[]>([])
  const [store, setStore] = useState<StoreItem[]>([])
  const [section, setSection] = useState<'tasks'|'assign'|'submissions'|'users'|'store'>('tasks')
  const [collapsed, setCollapsed] = useState(false)

  // hydrate collapsed state from localStorage
  useEffect(() => {
    try {
      const v = window.localStorage.getItem('adminSidebarCollapsed')
      if (v === '1') setCollapsed(true)
    } catch {}
  }, [])

  // keyboard shortcut Ctrl+B to toggle sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setCollapsed(v => { const nv = !v; try { window.localStorage.setItem('adminSidebarCollapsed', nv ? '1' : '0') } catch {}; return nv })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleSidebar = () => setCollapsed(v => { const nv = !v; try { window.localStorage.setItem('adminSidebarCollapsed', nv ? '1' : '0') } catch {}; return nv })

  // create task
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<number|''>('')
  const [description, setDescription] = useState('')
  const [createTagId, setCreateTagId] = useState<number|''>('')

  // assign task
  const [userId, setUserId] = useState<number|''>('')
  const [taskId, setTaskId] = useState<number|''>('')

  // user management
  const [newTagId, setNewTagId] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'admin'|'user'>('user')
  const [userMsg, setUserMsg] = useState('')

  // store management
  const [itemTitle, setItemTitle] = useState('')
  const [itemCost, setItemCost] = useState<number|''>('')
  const [itemDesc, setItemDesc] = useState('')
  const [storeBusyId, setStoreBusyId] = useState<number|null>(null)
  const [storeNotice, setStoreNotice] = useState<{ type: 'success'|'error'; text: string } | null>(null)

  const loadAll = async () => {
    const [t, a, u, tg, si] = await Promise.all([
      fetch('/api/tasks').then(r=>r.json()),
      fetch('/api/admin/assignments').then(r=>r.json()),
      fetch('/api/admin/users').then(r=>r.json()),
      fetch('/api/admin/tags').then(r=>r.json()),
      fetch('/api/store').then(r=>r.json()),
    ])
    setTasks(t.tasks||[])
    setAssignments(a.assignments||[])
    setUsers(u.users||[])
    setTags(tg.tags||[])
    setStore(si.items||[])
  }

  useEffect(()=>{ loadAll() },[])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault(); if(!title || !points) return
    const r = await fetch('/api/tasks',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, points, description })})
    const d = await r.json().catch(()=>null)
    const newTaskId = d?.task?.id as number | undefined
    if (newTaskId && createTagId) {
      await fetch('/api/admin/tasks/set-tag',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ taskId: newTaskId, tagId: createTagId }) })
    }
    setTitle(''); setPoints(''); setDescription(''); setCreateTagId(''); loadAll()
  }

  const onAssign = async (e: React.FormEvent) => {
    e.preventDefault(); if(!userId || !taskId) return
    await fetch('/api/assign',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, taskId })})
    setUserId(''); setTaskId(''); loadAll()
  }

  const pending = useMemo(()=>assignments.filter(a=>a.status==='pending'),[assignments])

  const act = async (id:number, action:'approve'|'reject') => {
    await fetch(`/api/assignments/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) })
    loadAll()
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault(); setUserMsg('')
    if (!newTagId || !newName) { setUserMsg('Bitte Tag und Name angeben.'); return }
    const r = await fetch('/api/admin/create-user', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ tagId: newTagId, name: newName, role: newRole }) })
    if (!r.ok) {
      const d = await r.json().catch(()=>({ error: 'Fehler' }))
      setUserMsg(d.error || 'Fehler')
      return
    }
    setNewTagId(''); setNewName(''); setNewRole('user')
    loadAll()
  }

  return (
    <div className="container">
      <div className={`admin-shell ${collapsed ? 'collapsed' : ''}` }>
        {/* Sidebar */}
        <aside className={`admin-sidebar card p-0 overflow-hidden ${collapsed ? 'collapsed' : ''}`}>
          <div className="p-3 border-b header">
            <button className="toggle" aria-label="Sidebar umschalten" aria-expanded={!collapsed} onClick={toggleSidebar}>{collapsed ? '☰' : '‹'}</button>
          </div>
          <nav className="flex flex-col">
            <button className={`sidebar-item ${section==='tasks'?'active':''}`} title="Aufgaben" onClick={()=>setSection('tasks')}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
              <span className="label">Aufgaben</span>
              <span className="tip">Aufgaben</span>
            </button>
            <button className={`sidebar-item ${section==='assign'?'active':''}`} title="Zuweisen" onClick={()=>setSection('assign')}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 110 10 5 5 0 010-10zm0 12c-4.97 0-9 2.239-9 5v3h18v-3c0-2.761-4.03-5-9-5z"/></svg>
              <span className="label">Zuweisen</span>
              <span className="tip">Zuweisen</span>
            </button>
            <button className={`sidebar-item ${section==='submissions'?'active':''}`} title="Abgaben" onClick={()=>setSection('submissions')}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              <span className="label">Abgaben</span>
              <span className="tip">Abgaben</span>
            </button>
            <button className={`sidebar-item ${section==='users'?'active':''}`} title="Nutzer" onClick={()=>setSection('users')}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9v-1a7 7 0 0114 0v1H5z"/></svg>
              <span className="label">Nutzer</span>
              <span className="tip">Nutzer</span>
            </button>
            <button className={`sidebar-item ${section==='store'?'active':''}`} title="Store" onClick={()=>setSection('store')}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6V4a2 2 0 00-2-2H10A2 2 0 008 4v2H3v2l2 12a2 2 0 002 2h10a2 2 0 002-2l2-12V6h-5zm-6 0V4h4v2h-4z"/></svg>
              <span className="label">Store</span>
              <span className="tip">Store</span>
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="space-y-6">
          {section === 'tasks' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Aufgaben</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Erstellen und organisieren (inkl. Tags).</p>
              </div>
              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Aufgabe erstellen</h2>
                <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3 items-end">
                  <input className="input flex-1 min-w-40" placeholder="Titel" value={title} onChange={e=>setTitle(e.target.value)} />
                  <input className="input w-28" type="number" placeholder="Punkte" value={points} onChange={e=>setPoints(parseInt(e.target.value||'0'))} />
                  <input className="input" placeholder="Beschreibung" value={description} onChange={e=>setDescription(e.target.value)} />
                  <select className="input" value={createTagId} onChange={e=>setCreateTagId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Tag wählen</option>
                    {tags.map(tag => (<option key={tag.id} value={tag.id}>{tag.name}</option>))}
                  </select>
                  <button className="btn btn-primary md:col-span-4">Erstellen</button>
                </form>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks.map(t=> (
                    <div key={t.id} className="border rounded p-3">
                      <div className="font-medium flex items-center justify-between">
                        <span className="break-words">{t.title}</span>
                        {(t.tagId || t.tag) && (
                          <span className="badge" style={{ background: (tags.find(tt=>tt.id===t.tagId)?.color) || undefined, color:'#fff', borderColor: 'transparent' }}>
                            {tags.find(tt=>tt.id===t.tagId)?.name || t.tag}
                          </span>
                        )}
                      </div>
                      {t.description && <div className="text-sm mt-1 break-words">{t.description}</div>}
                      <div className="text-sm text-gray-600 mt-2">{t.points} Punkte</div>
                      <div className="mt-2 flex gap-2 items-end">
                        <select className="input" value={t.tagId || ''} onChange={async e=>{ const v = e.target.value ? Number(e.target.value) : null; await fetch('/api/admin/tasks/set-tag',{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ taskId: t.id, tagId: v })}); loadAll() }}>
                          <option value="">Tag wählen</option>
                          {tags.map(tag => (<option key={tag.id} value={tag.id}>{tag.name}</option>))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Tags verwalten</h2>
                <TagManager tags={tags} onChange={loadAll} />
              </div>
            </div>
          )}

          {section === 'assign' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Zuweisen</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Aufgaben einem Nutzer zuweisen.</p>
              </div>
              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Aufgabe zuweisen</h2>
                <form onSubmit={onAssign} className="grid md:grid-cols-3 gap-3 items-end">
                  <select className="input min-w-40 !text-base !leading-snug" value={userId} onChange={e=>setUserId(Number(e.target.value))}>
                    <option value="">Nutzer wählen</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name ? `${u.name} (${u.tagId})` : u.tagId}</option>
                    ))}
                  </select>
                  <select className="input min-w-40 !text-base !leading-snug" value={taskId} onChange={e=>setTaskId(Number(e.target.value))}>
                    <option value="">Aufgabe wählen</option>
                    {tasks.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
                  </select>
                  <button className="btn btn-primary">Zuweisen</button>
                </form>
              </div>
            </div>
          )}

          {section === 'submissions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Abgaben</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Prüfen und bestätigen/ablehnen.</p>
              </div>
              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Ausstehende Abgaben</h2>
                {pending.length === 0 ? (
                  <div className="text-sm text-gray-600">Keine ausstehenden Abgaben.</div>
                ) : (
                  <ul className="space-y-2">
                    {pending.map(a => (
                      <li key={a.id} className="flex items-center justify-between">
                        <div className="break-words">{a.taskTitle || `Task #${a.taskId}`} – {a.userName || `User #${a.userId}`}</div>
                        <div className="flex gap-2">
                          <button onClick={()=>act(a.id,'approve')} className="btn btn-success">Bestätigen</button>
                          <button onClick={()=>act(a.id,'reject')} className="btn btn-danger">Ablehnen</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {section === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Nutzer</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Anlegen, befördern und löschen.</p>
              </div>
              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Nutzer verwalten</h2>
                <form onSubmit={createUser} className="grid md:grid-cols-4 gap-3 items-end">
                  <input className="input" placeholder="RFID Tag ID" value={newTagId} onChange={e=>setNewTagId(e.target.value)} />
                  <input className="input" placeholder="Name" value={newName} onChange={e=>setNewName(e.target.value)} />
                  <select className="input" value={newRole} onChange={e=>setNewRole(e.target.value as 'admin'|'user')}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn btn-primary">Erstellen</button>
                  {userMsg && <div className="text-red-600 text-sm md:col-span-4">{userMsg}</div>}
                </form>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {users.map(u => (
                    <div key={u.id} className="border rounded p-3 space-y-2">
                      <div className="font-medium break-words flex items-center justify-between">
                        <span>{u.name || '—'}</span>
                        {u.role && <span className="badge ml-2">{u.role}</span>}
                      </div>
                      <div className="text-sm text-gray-600 break-words">Tag: {u.tagId}</div>
                      {typeof u.points === 'number' && <div className="text-sm text-gray-600">Punkte: {u.points}</div>}
                      <div className="flex gap-2 pt-1">
                        {u.role !== 'admin' ? (
                          <button onClick={async()=>{await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body: JSON.stringify({ userId: u.id, role:'admin' })}); loadAll()}} className="btn btn-success">Zu Admin machen</button>
                        ) : (
                          <button onClick={async()=>{await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body: JSON.stringify({ userId: u.id, role:'user' })}); loadAll()}} className="btn">Zu User machen</button>
                        )}
                        <button onClick={async()=>{ if(confirm('Nutzer löschen?')) { await fetch(`/api/admin/users?userId=${u.id}`,{method:'DELETE'}); loadAll() } }} className="btn btn-danger">Löschen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === 'store' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Store</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Artikel anlegen und verwalten.</p>
              </div>
              <div className="card p-5 space-y-3">
                <h2 className="text-lg font-semibold">Artikel anlegen</h2>
                <form onSubmit={async(e)=>{e.preventDefault(); if(!itemTitle || !itemCost){return} const r = await fetch('/api/store',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: itemTitle, cost: itemCost, description: itemDesc })}); if (r.ok) { setItemTitle(''); setItemCost(''); setItemDesc(''); setStoreNotice({ type:'success', text:'Artikel angelegt.' }) } else { const d = await r.json().catch(()=>({error:'Fehler'})); setStoreNotice({ type:'error', text: d.error || 'Fehler' }) } loadAll()}} className="grid md:grid-cols-4 gap-3 items-end">
                  <input className="input" placeholder="Titel" value={itemTitle} onChange={e=>setItemTitle(e.target.value)} />
                  <input className="input" type="number" placeholder="Kosten" value={itemCost} onChange={e=>setItemCost(parseInt(e.target.value||'0'))} />
                  <input className="input" placeholder="Beschreibung" value={itemDesc} onChange={e=>setItemDesc(e.target.value)} />
                  <button className="btn btn-primary">Anlegen</button>
                </form>
                {storeNotice && (
                  <div className={`text-sm px-3 py-2 rounded border ${storeNotice.type==='success' ? 'border-green-600 text-green-400' : 'border-red-600 text-red-400'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span>{storeNotice.text}</span>
                      <button className="text-current" onClick={()=>setStoreNotice(null)}>✕</button>
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {store.map(it => (
                    <div key={it.id} className="border rounded p-3 space-y-2">
                      <div className="font-medium flex items-center justify-between">
                        <span className="break-words">{it.title}</span>
                        <span className="badge">{it.cost} Punkte</span>
                      </div>
                      {it.description && <div className="text-sm text-gray-600 break-words">{it.description}</div>}
                      <div className="pt-1">
                        <button disabled={storeBusyId===it.id} onClick={async()=>{ if(confirm('Artikel löschen?')) { setStoreBusyId(it.id); const r = await fetch(`/api/store?id=${it.id}`, { method:'DELETE' }); setStoreBusyId(null); if (r.ok) { setStoreNotice({ type:'success', text:'Artikel gelöscht.' }) } else { const d = await r.json().catch(()=>({error:'Fehler'})); setStoreNotice({ type:'error', text: d.error || 'Fehler' }) } loadAll() } }} className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed">Löschen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function TagManager({ tags, onChange }: { tags: {id:number; name:string; color:string}[]; onChange: ()=>void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#0ea5e9')
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if(!name || !color) return
    await fetch('/api/admin/tags',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, color })})
    setName(''); onChange()
  }
  return (
    <div className="space-y-3">
      <form onSubmit={create} className="grid md:grid-cols-3 gap-3 items-end">
        <input className="input" placeholder="Tag Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" type="color" value={color} onChange={e=>setColor(e.target.value)} />
        <button className="btn btn-primary">Erstellen</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <span key={t.id} className="badge" style={{ background: t.color, borderColor: 'transparent', color: '#fff' }}>
            {t.name}
            <button onClick={async()=>{ await fetch(`/api/admin/tags?tagId=${t.id}`,{method:'DELETE'}); onChange() }} className="ml-2" style={{ color: '#fff' }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}
