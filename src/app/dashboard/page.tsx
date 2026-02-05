'use client'
import { useEffect, useState } from 'react'

type User = { id:number; role:'admin'|'user'; points:number; tagId:string; name?:string }
type Task = { id:number; title:string; points:number; description?:string; tagIds?: number[] }
type Tag = { id:number; name:string; color:string }
type Assignment = { id:number; taskId:number; userId:number; status:string; taskTitle?:string; taskPoints?:number; description?:string; tagIds?: number[]; userName?:string }
type StoreItem = { id:number; title:string; cost:number; description?:string }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [redeemPoints, setRedeemPoints] = useState<number|''>('')
  const [items, setItems] = useState<StoreItem[]>([])
  const [snackbar, setSnackbar] = useState<{ type: 'success'|'error'; text: string } | null>(null)
  const [section, setSection] = useState<'tasks'|'store'|'history'>('tasks')
  const [loadingAssignmentId, setLoadingAssignmentId] = useState<number | null>(null)

  const loadAll = async () => {
    const [rUser, rAssignments, rTasks, rTags, rStore] = await Promise.all([
      fetch('/api/me', { cache: 'no-store' }),
      fetch('/api/user/assignments', { cache: 'no-store' }).catch(()=>null),
      fetch('/api/tasks', { cache: 'no-store' }).catch(()=>null),
      fetch('/api/tags', { cache: 'no-store' }).catch(()=>null),
      fetch('/api/store', { cache: 'no-store' }).catch(()=>null)
    ])
    const dUser = await rUser.json()
    if (dUser.user?.role === 'admin') {
      window.location.href = '/admin/workspace'
      return
    }
    setUser(dUser.user || null)
    if (dUser.user) {
      const dAssignments = rAssignments ? await rAssignments.json() : { assignments: [] }
      setAssignments(dAssignments.assignments || [])
      const dTasks = rTasks ? await rTasks.json() : { tasks: [] }
      setTasks(dTasks.tasks || [])
      const dTags = rTags ? await rTags.json() : { tags: [] }
      setTags(dTags.tags || [])
      const dStore = rStore ? await rStore.json() : { items: [] }
      setItems(dStore.items || [])
    }
  }

  useEffect(() => {
    loadAll()
    const timer = setTimeout(() => setSnackbar(null), 3000)
    return () => clearTimeout(timer)
  }, [snackbar])

  useEffect(() => {
    loadAll()
  }, [])

  const getAssignedUsers = (taskId: number) => {
    return assignments
      .filter(a => a.taskId === taskId && a.status === 'assigned')
      .map(a => ({
        id: a.userId,
        name: a.userName || '',
        tagId: a.userName ? a.userName.charAt(0).toUpperCase() : 'U'
      }))
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen">Bitte einloggen…</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
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
                onClick={()=>setSection('tasks')}
                style={{
                  backgroundColor: section === 'tasks' ? '#f6c453' : 'transparent',
                  color: section === 'tasks' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Aufgaben
              </button>
              <button
                onClick={()=>setSection('store')}
                style={{
                  backgroundColor: section === 'store' ? '#f6c453' : 'transparent',
                  color: section === 'store' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Store
              </button>
              <button
                onClick={()=>setSection('history')}
                style={{
                  backgroundColor: section === 'history' ? '#f6c453' : 'transparent',
                  color: section === 'history' ? '#1a1a1a' : '#a0a0a0',
                }}
                className="px-4 py-2 rounded transition-all font-medium hover:text-yellow-400 hover:bg-gray-800/70"
              >
                Historie
              </button>
            </div>
            <button onClick={async()=>{ await fetch('/api/logout',{ method:'POST' }); window.location.href='/' }} className="btn btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* User Info Card */}
        <div className="card p-5 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{user.name || user.tagId}</h2>
              <div className="text-gray-400 mt-1">Punkte: <span className="text-yellow-400 font-semibold">{user.points}</span></div>
            </div>
          </div>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Punkte einlösen</label>
              <form onSubmit={async(e)=>{
                e.preventDefault()
                if(!redeemPoints) return
                const r = await fetch('/api/redeem',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ points: redeemPoints })})
                if (r.ok) {
                  setUser(u => u ? { ...u, points: Math.max(0, u.points - Number(redeemPoints)) } : u)
                  setRedeemPoints('')
                  setSnackbar({ type: 'success', text: 'Punkte erfolgreich eingelöst' })
                } else {
                  const d = await r.json().catch(()=>({ error: 'Fehler beim Einlösen' }))
                  setSnackbar({ type: 'error', text: d.error || 'Fehler beim Einlösen' })
                }
              }} className="flex items-end gap-2">
                <input type="number" className="input w-32" value={redeemPoints} onChange={e=>setRedeemPoints(parseInt(e.target.value||'0'))} />
                <button className="btn btn-primary">Einlösen</button>
              </form>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        {section === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Deine Aufgaben</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignments.filter(a=>a.status==='assigned' || a.status==='pending').map(a => {
                const task = tasks.find(t => t.id === a.taskId)
                const assignedUsers = getAssignedUsers(a.taskId)
                return (
                  <div key={a.id} className="card p-3 flex flex-col justify-between min-h-[200px]">
                    <div>
                      <div className="font-medium flex items-center justify-between gap-2">
                        <span className="break-words card-title flex-1">{a.taskTitle || `Task #${a.taskId}`}</span>
                        {task?.tagIds && task.tagIds.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {task.tagIds.map(tagId => {
                              const tag = tags.find(t => t.id === tagId)
                              if (!tag) return null
                              return (
                                <span key={tagId} className="badge text-xs" style={{ background: tag.color, color:'#fff', borderColor: 'transparent' }}>
                                  {tag.name}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {(a.description || task?.description) && <div className="text-sm mt-1 break-words">{a.description || task?.description}</div>}
                      <div className="text-sm text-gray-600 mt-2">{a.taskPoints ?? 0} Punkte</div>
                      {/* Assigned Users */}
                      {assignedUsers.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {assignedUsers.slice(0, 3).map((u, idx) => (
                              <div
                                key={`${a.taskId}-${u.id}`}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-semibold text-gray-900 border-2 border-gray-800 hover:z-10 transition-transform hover:scale-110 cursor-help"
                                title={u.name || u.tagId}
                                style={{ zIndex: 3 - idx }}
                              >
                                {(u.name || u.tagId).charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {assignedUsers.length > 3 && (
                              <div
                                className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 border-2 border-gray-800"
                                title={`${assignedUsers.length - 3} weitere`}
                              >
                                +{assignedUsers.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {assignedUsers.length === 1 ? '1 Person zugewiesen' : `${assignedUsers.length} Personen zugewiesen`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      {a.status === 'assigned' ? (
                        <button 
                          disabled={loadingAssignmentId === a.id}
                          onClick={async()=>{
                            setLoadingAssignmentId(a.id)
                            try {
                              const res = await fetch(`/api/assignments/${a.id}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'complete' })})
                              if (res.ok) {
                                setSnackbar({ type: 'success', text: 'Aufgabe als abgeschlossen markiert' })
                                await loadAll()
                              } else {
                                setSnackbar({ type: 'error', text: 'Fehler beim Abschließen' })
                              }
                            } catch (e) {
                              setSnackbar({ type: 'error', text: 'Fehler beim Abschließen' })
                            } finally {
                              setLoadingAssignmentId(null)
                            }
                          }} 
                          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingAssignmentId === a.id ? '⏳ ...' : 'Abschließen'}
                        </button>
                      ) : a.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            disabled={loadingAssignmentId === a.id}
                            onClick={async()=>{
                              setLoadingAssignmentId(a.id)
                              try {
                                const res = await fetch(`/api/assignments/${a.id}`,{method:'DELETE'})
                                if (res.ok) {
                                  setSnackbar({ type: 'success', text: 'Aufgabe rückgängig gemacht' })
                                  await loadAll()
                                } else {
                                  setSnackbar({ type: 'error', text: 'Fehler beim Rückgängigmachen' })
                                }
                              } catch (e) {
                                setSnackbar({ type: 'error', text: 'Fehler beim Rückgängigmachen' })
                              } finally {
                                setLoadingAssignmentId(null)
                              }
                            }} 
                            className="btn btn-secondary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingAssignmentId === a.id ? '⏳ ...' : 'Rückgängig'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Status: {a.status === 'approved' ? '✓ Genehmigt' : '✕ Abgelehnt'}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Store Section */}
        {section === 'store' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Store</h2>
              <div className="text-sm text-gray-400">Deine Punkte: <span className="text-yellow-400 font-semibold">{user.points}</span></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(it => (
                <div key={it.id} className="card p-3 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div className="font-medium flex items-center justify-between gap-2">
                      <span className="break-words card-title flex-1">{it.title}</span>
                      <span className="badge text-xs">{it.cost} Punkte</span>
                    </div>
                    {it.description && <div className="text-sm text-gray-600 break-words mt-1">{it.description}</div>}
                  </div>
                  <button
                    disabled={user.points < it.cost}
                    onClick={async()=>{
                      const r = await fetch('/api/store/redeem', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itemId: it.id }) })
                      if (r.ok) {
                        const d = await r.json().catch(()=>null)
                        const updatedPoints = d?.user?.points as number | undefined
                        if (typeof updatedPoints === 'number') setUser(u => u ? { ...u, points: updatedPoints } : u)
                        setSnackbar({ type: 'success', text: `"${it.title}" eingelöst` })
                      } else {
                        const d = await r.json().catch(()=>({ error: 'Fehler' }))
                        setSnackbar({ type: 'error', text: d.error || 'Fehler' })
                      }
                    }}
                    className="btn btn-primary w-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={user.points < it.cost ? 'Zu wenig Punkte' : 'Einlösen'}
                  >
                    Einlösen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {section === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historie</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignments.filter(a=>a.status==='approved' || a.status==='rejected').map(a => {
                const task = tasks.find(t => t.id === a.taskId)
                const assignedUsers = getAssignedUsers(a.taskId)
                return (
                  <div key={a.id} className="card p-3 flex flex-col justify-between min-h-[200px]">
                    <div>
                      <div className="font-medium flex items-center justify-between gap-2">
                        <span className="break-words card-title flex-1">{a.taskTitle || `Task #${a.taskId}`}</span>
                        {task?.tagIds && task.tagIds.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {task.tagIds.map(tagId => {
                              const tag = tags.find(t => t.id === tagId)
                              if (!tag) return null
                              return (
                                <span key={tagId} className="badge text-xs" style={{ background: tag.color, color:'#fff', borderColor: 'transparent' }}>
                                  {tag.name}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {(a.description || task?.description) && <div className="text-sm mt-1 break-words">{a.description || task?.description}</div>}
                      <div className="text-sm text-gray-600 mt-2">{a.taskPoints ?? 0} Punkte</div>
                      {/* Assigned Users */}
                      {assignedUsers.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {assignedUsers.slice(0, 3).map((u, idx) => (
                              <div
                                key={`${a.taskId}-${u.id}`}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-semibold text-gray-900 border-2 border-gray-800 hover:z-10 transition-transform hover:scale-110 cursor-help"
                                title={u.name || u.tagId}
                                style={{ zIndex: 3 - idx }}
                              >
                                {(u.name || u.tagId).charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {assignedUsers.length > 3 && (
                              <div
                                className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 border-2 border-gray-800"
                                title={`${assignedUsers.length - 3} weitere`}
                              >
                                +{assignedUsers.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {assignedUsers.length === 1 ? '1 Person zugewiesen' : `${assignedUsers.length} Personen zugewiesen`}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-2">Status: <span className="text-gray-400 font-medium">{a.status === 'approved' ? '✓ Genehmigt' : '✕ Abgelehnt'}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
          <div className={`card p-3 flex items-center justify-between text-sm ${snackbar.type === 'success' ? 'border border-green-600' : 'border border-red-600'}`}>
            <span>{snackbar.text}</span>
            <button onClick={() => setSnackbar(null)} className="text-gray-400 hover:text-gray-200">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
