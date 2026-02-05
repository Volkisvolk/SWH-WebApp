import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/auth'
import { listAssignmentsForUser, listTasks, listUsers } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ assignments: [] })
  const session = verifySession(token)
  if (!session) return NextResponse.json({ assignments: [] })
  const [assignments, tasks, users] = await Promise.all([
    listAssignmentsForUser(session.id),
    listTasks(),
    listUsers(),
  ])
  const withDetails = assignments.map(a => {
    const t = tasks.find(t => t.id === a.taskId)
    const assigneeUser = users.find(u => u.id === a.userId)
    return { ...a, taskTitle: t?.title || `Task #${a.taskId}`, taskPoints: t?.points ?? 0, description: t?.description, tag: t?.tag, userName: assigneeUser?.name }
  })
  return NextResponse.json({ assignments: withDetails })
}
