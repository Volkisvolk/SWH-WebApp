import { NextRequest, NextResponse } from 'next/server'
import { listAllAssignments, listTasks, listUsers } from '@/lib/db'
import { COOKIE_NAME, verifySession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const [assignments, tasks, users] = await Promise.all([
    listAllAssignments(),
    listTasks(),
    listUsers(),
  ])
  const detailed = assignments.map(a => ({
    ...a,
    taskTitle: tasks.find(t => t.id === a.taskId)?.title || `Task #${a.taskId}`,
    userName: users.find(u => u.id === a.userId)?.name || users.find(u => u.id === a.userId)?.tagId || `User #${a.userId}`,
  }))
  return NextResponse.json({ assignments: detailed })
}
