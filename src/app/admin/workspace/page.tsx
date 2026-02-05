"use client"
import { useEffect, useMemo, useState } from 'react'

type Task = { id:number; title:string; points:number; description?:string; tag?:string; tagIds?: number[] }

type Assignment = { id:number; taskId:number; userId:number; status:string; taskTitle?:string; userName?:string }
type StoreItem = { id:number; title:string; cost:number; description?:string }
type User = { id:number; tagId:string; name?:string; role?: 'admin'|'user'; points?: number }

export default function AdminWorkspace() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<{id:number; name:string; color:string}[]>([])
  const [store, setStore] = useState<StoreItem[]>([])
  const [section, setSection] = useState<'tasks'|'submissions'|'users'|'store'>('tasks')
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
  const [createTagIds, setCreateTagIds] = useState<number[]>([])
  const [showCreateTask, setShowCreateTask] = useState(false)

  // task menu + edit
  const [taskMenuOpenId, setTaskMenuOpenId] = useState<number | null>(null)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPoints, setEditPoints] = useState<number|''>('')
  const [editDescription, setEditDescription] = useState('')
  const [editTagIds, setEditTagIds] = useState<number[]>([])

  // tag editing for tasks
  const [showEditTaskTags, setShowEditTaskTags] = useState(false)
  const [editTaskForTags, setEditTaskForTags] = useState<Task | null>(null)

  // task deletion
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null)

  // snackbar
  const [snackbar, setSnackbar] = useState<{ type: 'success'|'error'; text: string } | null>(null)

  // tag manager
  const [showTagManager, setShowTagManager] = useState(false)

  // assign task
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignTask, setAssignTask] = useState<Task | null>(null)
  const [assignSearch, setAssignSearch] = useState('')

  // user management
  const [newTagId, setNewTagId] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'admin'|'user'>('user')
  const [userMsg, setUserMsg] = useState('')
  const [showCreateUser, setShowCreateUser] = useState(false)

  // store management
  const [itemTitle, setItemTitle] = useState('')
  const [itemCost, setItemCost] = useState<number|''>('')
  const [itemDesc, setItemDesc] = useState('')
  const [storeBusyId, setStoreBusyId] = useState<number|null>(null)
  const [storeNotice, setStoreNotice] = useState<{ type: 'success'|'error'; text: string } | null>(null)
  const [showCreateItem, setShowCreateItem] = useState(false)

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

  // Auto-close snackbar after 3 seconds
  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => {
        setSnackbar(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [snackbar])

  // Get assigned users for a task
  const getAssignedUsers = (taskId: number) => {
    const taskAssignments = assignments.filter(a => a.taskId === taskId && a.status === 'assigned')
    return taskAssignments.map(a => users.find(u => u.id === a.userId)).filter(Boolean) as User[]
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault(); if(!title || !points) return
    const r = await fetch('/api/tasks',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, points, description })})
    const d = await r.json().catch(()=>null)
    const newTaskId = d?.task?.id as number | undefined
    if (newTaskId && createTagIds.length > 0) {
      await fetch('/api/admin/tasks/set-tag',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ taskId: newTaskId, tagIds: createTagIds }) })
    }
    setTitle(''); setPoints(''); setDescription(''); setCreateTagIds([])
    setSnackbar({ type: 'success', text: 'Aufgabe erfolgreich erstellt' })
    loadAll()
  }

  const assignTaskToUser = async (taskId: number, userId: number) => {
    await fetch('/api/assign', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ userId, taskId })
    })
    setSnackbar({ type: 'success', text: 'Person erfolgreich zugewiesen' })
    loadAll()
  }

  const unassignTaskFromUser = async (assignmentId: number) => {
    await fetch(`/api/assignments/${assignmentId}`, {
      method: 'DELETE'
    })
    setSnackbar({ type: 'success', text: 'Zuweisung erfolgreich entfernt' })
    loadAll()
  }

  const isUserAssigned = (taskId: number, userId: number) => {
    return assignments.some(a => a.taskId === taskId && a.userId === userId && a.status === 'assigned')
  }

  const getAssignmentId = (taskId: number, userId: number) => {
    return assignments.find(a => a.taskId === taskId && a.userId === userId && a.status === 'assigned')?.id
  }

  const openEditTask = (t: Task) => {
    setEditTask(t)
    setEditTitle(t.title)
    setEditPoints(t.points)
    setEditDescription(t.description || '')
    setEditTagIds(t.tagIds || [])
    setShowEditTask(true)
    setTaskMenuOpenId(null)
  }

  const saveEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTask || !editTitle || editPoints === '') return
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        id: editTask.id,
        title: editTitle,
        points: editPoints,
        description: editDescription
      })
    })
    // Speichere Tags separat
    if (editTagIds.length > 0 || editTask.tagIds?.length) {
      await fetch('/api/admin/tasks/set-tag', {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          taskId: editTask.id,
          tagIds: editTagIds.length > 0 ? editTagIds : null
        })
      })
    }
    setShowEditTask(false)
    setEditTask(null)
    setSnackbar({ type: 'success', text: 'Aufgabe erfolgreich aktualisiert' })
    loadAll()
  }

  const pending = useMemo(()=>assignments.filter(a=>a.status==='pending'),[assignments])

  const act = async (id:number, action:'approve'|'reject') => {
    await fetch(`/api/assignments/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) })
    setSnackbar({ type: 'success', text: action === 'approve' ? 'Abgabe genehmigt' : 'Abgabe abgelehnt' })
    loadAll()
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault(); setUserMsg('')
    if (!newTagId || !newName) { setUserMsg('Bitte Tag und Name angeben.'); return }
    const r = await fetch('/api/admin/create-user', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ tagId: newTagId, name: newName, role: newRole }) })
    if (!r.ok) {
      const d = await r.json().catch(()=>({ error: 'Fehler' }))
      setUserMsg(d.error || 'Fehler')
      setSnackbar({ type: 'error', text: d.error || 'Fehler beim Erstellen des Nutzers' })
      return
    }
    setNewTagId(''); setNewName(''); setNewRole('user')
    setSnackbar({ type: 'success', text: 'Nutzer erfolgreich erstellt' })
    loadAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 ${snackbar.type === 'success' ? 'bg-green-900 text-green-100 border border-green-700' : 'bg-red-900 text-red-100 border border-red-700'}`}>
            <span>{snackbar.text}</span>
            <button onClick={() => setSnackbar(null)} className="ml-2 text-lg">✕</button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              <span className="font-semibold text-lg">BeeApp</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                style={{
                  backgroundColor: section === 'tasks' ? '#f6c453' : 'transparent',
                  color: section === 'tasks' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
                onClick={() => setSection('tasks')}
              >
                Aufgaben
              </button>
              <button
                style={{
                  backgroundColor: section === 'submissions' ? '#f6c453' : 'transparent',
                  color: section === 'submissions' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
                onClick={() => setSection('submissions')}
              >
                Abgaben
              </button>
              <button
                style={{
                  backgroundColor: section === 'users' ? '#f6c453' : 'transparent',
                  color: section === 'users' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
                onClick={() => setSection('users')}
              >
                Nutzer
              </button>
              <button
                style={{
                  backgroundColor: section === 'store' ? '#f6c453' : 'transparent',
                  color: section === 'store' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
                onClick={() => setSection('store')}
              >
                Store
              </button>
              <a
                href="/admin/rfid"
                style={{
                  color: '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
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
          {section === 'tasks' && (
            <div className="space-y-6">
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Aufgaben</h2>
                  <button className="btn btn-primary" title="Öffnet ein Popup zum Anlegen einer Aufgabe" onClick={()=>setShowCreateTask(true)}>
                    Aufgabe erstellen
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks.map(t=> (
                    <div key={t.id} className="card p-3 flex flex-col justify-between min-h-[200px]">
                      <div>
                        <div className="font-medium flex items-center justify-between">
                          <span className="break-words card-title">{t.title}</span>
                          <div className="flex items-center gap-2">
                            {t.tagIds && t.tagIds.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {t.tagIds.map(tagId => {
                                  const tag = tags.find(tt => tt.id === tagId)
                                  if (!tag) return null
                                  return (
                                    <span key={tagId} className="badge text-xs" style={{ background: tag.color, color:'#fff', borderColor: 'transparent' }}>
                                      {tag.name}
                                    </span>
                                  )
                                })}
                              </div>
                            ) : null}
                            <div className="relative">
                              <button
                                className="btn btn-secondary px-1.5 py-0.5 text-xs"
                                aria-label="Aufgabe Optionen"
                                onClick={()=>setTaskMenuOpenId(taskMenuOpenId === t.id ? null : t.id)}
                              >
                                ⋯
                              </button>
                              {taskMenuOpenId === t.id && (
                                <div className="absolute right-0 mt-2 w-40 card p-1 z-20">
                                  <button className="btn btn-secondary w-full justify-start text-xs px-2 py-1" onClick={()=>{ openEditTask(t); setTaskMenuOpenId(null) }}>
                                    Bearbeiten
                                  </button>
                                  <button className="btn btn-danger w-full justify-start text-xs px-2 py-1 mt-0.5" onClick={()=>{ setDeleteConfirmTask(t); setTaskMenuOpenId(null) }}>
                                    Löschen
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {t.description && <div className="text-sm mt-1 break-words">{t.description}</div>}
                        <div className="text-sm text-gray-600 mt-2">{t.points} Punkte</div>
                        
                        {/* Assigned Users */}
                        {getAssignedUsers(t.id).length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-2">
                              {getAssignedUsers(t.id).slice(0, 3).map((user, idx) => (
                                <div
                                  key={`${t.id}-${user.id}`}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-semibold text-gray-900 border-2 border-gray-800 hover:z-10 transition-transform hover:scale-110"
                                  title={user.name || user.tagId}
                                  style={{ zIndex: 3 - idx }}
                                >
                                  {(user.name || user.tagId).charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {getAssignedUsers(t.id).length > 3 && (
                                <div
                                  className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 border-2 border-gray-800"
                                  title={`${getAssignedUsers(t.id).length - 3} weitere`}
                                >
                                  +{getAssignedUsers(t.id).length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {getAssignedUsers(t.id).length === 1 ? '1 Person zugewiesen' : `${getAssignedUsers(t.id).length} Personen zugewiesen`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <button className="btn btn-primary w-full" onClick={()=>{ setAssignTask(t); setShowAssignModal(true) }}>
                          Zuweisen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Tags</h2>
                  <button className="btn btn-primary" onClick={()=>setShowTagManager(true)}>
                    Tags verwalten
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    <div className="text-sm text-gray-500">Keine Tags vorhanden. Erstelle neue Tags um Aufgaben zu kategorisieren.</div>
                  ) : (
                    tags.map(t => (
                      <span key={t.id} className="badge text-sm px-3 py-1.5" style={{ background: t.color, borderColor: 'transparent', color: '#fff' }}>
                        {t.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {showCreateTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setShowCreateTask(false)} />
              <div className="relative card w-full max-w-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Neue Aufgabe</h3>
                  <button className="btn btn-secondary" onClick={()=>setShowCreateTask(false)}>Schließen</button>
                </div>
                <form onSubmit={async (e)=>{ await onCreate(e); setShowCreateTask(false) }} className="grid gap-3">
                  <input className="input" placeholder="Titel" value={title} onChange={e=>setTitle(e.target.value)} />
                  <input className="input" type="number" placeholder="Punkte" value={points} onChange={e=>setPoints(parseInt(e.target.value||'0'))} />
                  <input className="input" placeholder="Beschreibung" value={description} onChange={e=>setDescription(e.target.value)} />
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => {
                        const isSelected = createTagIds.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const newTagIds = isSelected
                                ? createTagIds.filter(id => id !== tag.id)
                                : [...createTagIds, tag.id]
                              setCreateTagIds(newTagIds)
                            }}
                            style={{
                              backgroundColor: isSelected ? tag.color : 'transparent',
                              borderColor: tag.color,
                              color: isSelected ? '#fff' : tag.color
                            }}
                            className="px-3 py-1 rounded border-2 transition-colors cursor-pointer font-medium text-sm"
                          >
                            {isSelected ? '✓ ' : ''}{tag.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <button className="btn btn-primary">Erstellen</button>
                </form>
              </div>
            </div>
          )}


          {showEditTask && editTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>{ setShowEditTask(false); setEditTask(null) }} />
              <div className="relative card w-full max-w-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Aufgabe bearbeiten</h3>
                    <div className="text-sm text-gray-600">{editTask.title}</div>
                  </div>
                  <button className="btn btn-secondary" onClick={()=>{ setShowEditTask(false); setEditTask(null) }}>Schließen</button>
                </div>
                <form onSubmit={saveEditTask} className="grid gap-3">
                  <input className="input" placeholder="Titel" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
                  <input className="input" type="number" placeholder="Punkte" value={editPoints} onChange={e=>setEditPoints(parseInt(e.target.value||'0'))} />
                  <input className="input" placeholder="Beschreibung" value={editDescription} onChange={e=>setEditDescription(e.target.value)} />
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (Mehrfachauswahl)</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => {
                        const isSelected = editTagIds.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const newTagIds = isSelected
                                ? editTagIds.filter(id => id !== tag.id)
                                : [...editTagIds, tag.id]
                              setEditTagIds(newTagIds)
                            }}
                            style={{
                              backgroundColor: isSelected ? tag.color : 'transparent',
                              borderColor: tag.color,
                              color: isSelected ? '#fff' : tag.color
                            }}
                            className="px-3 py-1 rounded border-2 transition-colors cursor-pointer font-medium text-sm"
                          >
                            {isSelected ? '✓ ' : ''}{tag.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <button className="btn btn-primary">Speichern</button>
                </form>
              </div>
            </div>
          )}

          {showAssignModal && assignTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>{ setShowAssignModal(false); setAssignTask(null); setAssignSearch('') }} />
              <div className="relative card w-full max-w-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Personen zuweisen</h3>
                    <div className="text-sm text-gray-600">{assignTask.title}</div>
                  </div>
                  <button className="btn btn-secondary" onClick={()=>{ setShowAssignModal(false); setAssignTask(null); setAssignSearch('') }}>Schließen</button>
                </div>
                
                {/* Currently Assigned */}
                {getAssignedUsers(assignTask.id).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400">Aktuell zugewiesen</h4>
                    <div className="space-y-1">
                      {getAssignedUsers(assignTask.id).map(u => {
                        const assignmentId = getAssignmentId(assignTask.id, u.id)
                        return (
                          <div key={u.id} className="flex items-center justify-between p-2 rounded bg-gray-800/50 border border-gray-700">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-sm font-semibold text-gray-900">
                                {(u.name || u.tagId).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{u.name || '—'}</div>
                                <div className="text-xs text-gray-500">{u.tagId}</div>
                              </div>
                            </div>
                            <button 
                              className="btn btn-danger text-xs px-2 py-1"
                              onClick={async ()=>{ if(assignmentId) await unassignTaskFromUser(assignmentId) }}
                            >
                              Entfernen
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="Suche nach Name oder Tag-ID..."
                    value={assignSearch}
                    onChange={e => setAssignSearch(e.target.value)}
                  />
                </div>

                {/* Available Users */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400">Weitere Personen</h4>
                  <div className="space-y-1 max-h-[40vh] overflow-auto">
                    {users
                      .filter(u => !isUserAssigned(assignTask.id, u.id))
                      .filter(u => {
                        if (!assignSearch) return true
                        const search = assignSearch.toLowerCase()
                        return (u.name?.toLowerCase().includes(search)) || u.tagId.toLowerCase().includes(search)
                      })
                      .map(u => (
                        <button
                          key={u.id}
                          className="flex items-center justify-between p-2 rounded bg-gray-800/30 border border-gray-700 hover:bg-gray-700/50 transition-colors w-full"
                          onClick={async ()=>{ await assignTaskToUser(assignTask.id, u.id) }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
                              {(u.name || u.tagId).charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{u.name || '—'}</div>
                              <div className="text-xs text-gray-500">{u.tagId}</div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">Zuweisen</span>
                        </button>
                      ))
                    }
                    {users.filter(u => !isUserAssigned(assignTask.id, u.id)).filter(u => {
                      if (!assignSearch) return true
                      const search = assignSearch.toLowerCase()
                      return (u.name?.toLowerCase().includes(search)) || u.tagId.toLowerCase().includes(search)
                    }).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        {assignSearch ? 'Keine Benutzer gefunden' : 'Alle Benutzer sind zugewiesen'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showEditTaskTags && editTaskForTags && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>{ setShowEditTaskTags(false); setEditTaskForTags(null) }} />
              <div className="relative card w-full max-w-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Tags Bearbeiten</h3>
                    <div className="text-sm text-gray-600">{editTaskForTags.title}</div>
                  </div>
                  <button className="btn btn-secondary" onClick={()=>{ setShowEditTaskTags(false); setEditTaskForTags(null) }}>Schließen</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Verfügbare Tags (Mehrfachauswahl)</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => {
                        const isSelected = editTaskForTags.tagIds?.includes(tag.id) || false
                        return (
                          <button
                            key={tag.id}
                            onClick={async ()=>{
                              try {
                                const currentTags = editTaskForTags.tagIds || []
                                const newTagIds = isSelected 
                                  ? currentTags.filter(id => id !== tag.id)
                                  : [...currentTags, tag.id]
                                const r = await fetch('/api/admin/tasks/set-tag', { 
                                  method:'PATCH', 
                                  headers:{'Content-Type':'application/json'}, 
                                  body: JSON.stringify({ taskId: editTaskForTags.id, tagIds: newTagIds.length > 0 ? newTagIds : null }) 
                                })
                                const data = await r.json()
                                if (r.ok && data.task) {
                                  setEditTaskForTags(data.task)
                                  setSnackbar({ type: 'success', text: `Tag ${isSelected ? 'entfernt' : 'hinzugefügt'}` })
                                  await loadAll()
                                } else {
                                  setSnackbar({ type: 'error', text: data.error || 'Fehler beim Speichern des Tags' })
                                }
                              } catch (e) {
                                setSnackbar({ type: 'error', text: 'Fehler beim Speichern des Tags' })
                              }
                            }}
                            style={{
                              backgroundColor: isSelected ? tag.color : 'transparent',
                              borderColor: tag.color,
                              color: isSelected ? '#fff' : tag.color
                            }}
                            className="px-3 py-1 rounded border-2 transition-colors cursor-pointer font-medium"
                          >
                            {isSelected ? '✓ ' : ''}{tag.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showTagManager && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setShowTagManager(false)} />
              <div className="relative card w-full max-w-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tags verwalten</h3>
                  <button className="btn btn-secondary" onClick={()=>setShowTagManager(false)}>Schließen</button>
                </div>
                <TagManager tags={tags} onChange={loadAll} />
              </div>
            </div>
          )}

          {deleteConfirmTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setDeleteConfirmTask(null)} />
              <div className="relative card w-full max-w-sm p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Aufgabe löschen?</h3>
                  <div className="text-sm text-gray-600 mt-2">{deleteConfirmTask.title}</div>
                </div>
                <p className="text-sm text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={()=>setDeleteConfirmTask(null)}>
                    Abbrechen
                  </button>
                  <button className="btn btn-danger flex-1" onClick={async ()=>{ await fetch(`/api/tasks?id=${deleteConfirmTask.id}`, {method:'DELETE'}); setDeleteConfirmTask(null); setSnackbar({ type: 'success', text: 'Aufgabe erfolgreich gelöscht' }); loadAll() }}>
                    Löschen
                  </button>
                </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Nutzer Übersicht</h2>
                <button className="btn btn-primary" title="Öffnet ein Popup zum Anlegen eines Nutzers" onClick={()=>setShowCreateUser(true)}>
                  Nutzer erstellen
                </button>
              </div>
              <div className="card p-5 space-y-3">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {users.map(u => (
                    <div key={u.id} className="card p-3 space-y-2">
                      <div className="font-medium break-words flex items-center justify-between">
                        <span className="card-title">{u.name || '—'}</span>
                        {u.role && <span className="badge ml-2">{u.role}</span>}
                      </div>
                      <div className="text-sm text-gray-600 break-words">Tag: {u.tagId}</div>
                      {typeof u.points === 'number' && <div className="text-sm text-gray-600">Punkte: {u.points}</div>}
                      <div className="flex gap-2 pt-1">
                        {u.role !== 'admin' ? (
                          <button onClick={async()=>{await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body: JSON.stringify({ userId: u.id, role:'admin' })}); setSnackbar({ type: 'success', text: 'Nutzer zu Admin bef\u00f6rdert' }); loadAll()}} className="btn btn-success">Zu Admin machen</button>
                        ) : (
                          <button onClick={async()=>{await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body: JSON.stringify({ userId: u.id, role:'user' })}); setSnackbar({ type: 'success', text: 'Admin zu User zur\u00fcckgestuft' }); loadAll()}} className="btn">Zu User machen</button>
                        )}
                        <button onClick={async()=>{ if(confirm('Nutzer l\u00f6schen?')) { await fetch(`/api/admin/users?userId=${u.id}`,{method:'DELETE'}); setSnackbar({ type: 'success', text: 'Nutzer erfolgreich gel\u00f6scht' }); loadAll() } }} className="btn btn-danger">L\u00f6schen</button>
                      </div>
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
                    <form onSubmit={async (e)=>{ await createUser(e); setShowCreateUser(false) }} className="grid gap-3">
                      <input className="input" placeholder="RFID Tag ID" value={newTagId} onChange={e=>setNewTagId(e.target.value)} />
                      <input className="input" placeholder="Name" value={newName} onChange={e=>setNewName(e.target.value)} />
                      <select className="input" value={newRole} onChange={e=>setNewRole(e.target.value as 'admin'|'user')}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="btn btn-primary">Erstellen</button>
                      {userMsg && <div className="text-red-600 text-sm">{userMsg}</div>}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'store' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Store</h1>
                <p className="text-sm text-gray-600" style={{maxWidth:600}}>Artikel anlegen und verwalten.</p>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Artikel Übersicht</h2>
                <button className="btn btn-primary" title="Öffnet ein Popup zum Anlegen eines Artikels" onClick={()=>setShowCreateItem(true)}>
                  Artikel erstellen
                </button>
              </div>
              <div className="card p-5 space-y-3">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {store.map(it => (
                    <div key={it.id} className="card p-3 space-y-2">
                      <div className="font-medium flex items-center justify-between">
                        <span className="break-words card-title">{it.title}</span>
                        <span className="badge">{it.cost} Punkte</span>
                      </div>
                      {it.description && <div className="text-sm text-gray-600 break-words">{it.description}</div>}
                      <div className="pt-1">
                        <button disabled={storeBusyId===it.id} onClick={async()=>{ if(confirm('Artikel l\u00f6schen?')) { setStoreBusyId(it.id); const r = await fetch(`/api/store?id=${it.id}`, { method:'DELETE' }); setStoreBusyId(null); if (r.ok) { setSnackbar({ type:'success', text:'Artikel erfolgreich gel\u00f6scht' }) } else { const d = await r.json().catch(()=>({error:'Fehler'})); setSnackbar({ type:'error', text: d.error || 'Fehler beim L\u00f6schen' }) } loadAll() } }} className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed">L\u00f6schen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCreateItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>setShowCreateItem(false)} />
              <div className="relative card w-full max-w-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Neuer Artikel</h3>
                  <button className="btn btn-secondary" onClick={()=>setShowCreateItem(false)}>Schließen</button>
                </div>
                <form onSubmit={async(e)=>{ e.preventDefault(); if(!itemTitle || !itemCost){return} const r = await fetch('/api/store',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: itemTitle, cost: itemCost, description: itemDesc })}); if (r.ok) { setItemTitle(''); setItemCost(''); setItemDesc(''); setSnackbar({ type:'success', text:'Artikel erfolgreich erstellt' }); setShowCreateItem(false); loadAll() } else { const d = await r.json().catch(()=>({error:'Fehler'})); setSnackbar({ type:'error', text: d.error || 'Fehler beim Erstellen' }) } }} className="grid gap-3">
                  <input className="input" placeholder="Titel" value={itemTitle} onChange={e=>setItemTitle(e.target.value)} />
                  <input className="input" type="number" placeholder="Kosten" value={itemCost} onChange={e=>setItemCost(parseInt(e.target.value||'0'))} />
                  <input className="input" placeholder="Beschreibung" value={itemDesc} onChange={e=>setItemDesc(e.target.value)} />
                  <button className="btn btn-primary">Erstellen</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function TagManager({ tags, onChange }: { tags: {id:number; name:string; color:string}[]; onChange: ()=>void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#0ea5e9')
  const [snackbar, setSnackbar] = useState<{ type: 'success'|'error'; text: string } | null>(null)
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if(!name || !color) return
    await fetch('/api/admin/tags',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, color })})
    setName(''); setColor('#0ea5e9')
    setSnackbar({ type: 'success', text: 'Tag erfolgreich erstellt' })
    onChange()
  }

  // Auto-close snackbar
  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [snackbar])
  return (
    <div className="space-y-5">
      {/* Snackbar */}
      {snackbar && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 ${snackbar.type === 'success' ? 'bg-green-900 text-green-100 border border-green-700' : 'bg-red-900 text-red-100 border border-red-700'}">
          <span>{snackbar.text}</span>
          <button onClick={() => setSnackbar(null)} className="ml-2 text-lg">✕</button>
        </div>
      )}
      
      {/* Create New Tag */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Neuen Tag erstellen</h4>
        <form onSubmit={create} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tag Name</label>
              <input className="input" placeholder="z.B. Wichtig, Dringend..." value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Farbe</label>
              <div className="flex gap-2">
                <input className="input flex-1" type="color" value={color} onChange={e=>setColor(e.target.value)} />
                <div className="w-10 h-10 rounded border-2 border-gray-700" style={{ backgroundColor: color }} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary w-full">Tag erstellen</button>
        </form>
      </div>

      {/* Existing Tags */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Vorhandene Tags ({tags.length})</h4>
        {tags.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">Noch keine Tags vorhanden</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-auto">
            {tags.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded border-2 border-gray-700 bg-gray-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: t.color }} />
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                <button 
                  onClick={async()=>{ 
                    if(confirm(`Tag "${t.name}" wirklich löschen?`)) {
                      await fetch(`/api/admin/tags?tagId=${t.id}`,{method:'DELETE'})
                      setSnackbar({ type: 'success', text: 'Tag erfolgreich gelöscht' })
                      onChange()
                    }
                  }} 
                  className="btn btn-danger text-xs px-2 py-1"
                  title="Tag löschen"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
