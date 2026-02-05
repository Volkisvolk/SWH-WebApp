// Simple JSON file DB using lowdb for users, tasks, and assignments
import { JSONFilePreset } from 'lowdb/node'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

export type Role = 'admin' | 'user'


export interface User {
  id: number
  tagId: string
  name?: string
  role: Role
  points: number
}

export interface Task {
  id: number
  title: string
  points: number
  description?: string
  tag?: string
  tagIds?: number[]
}

export type AssignmentStatus = 'assigned' | 'pending' | 'approved' | 'rejected'

export interface Assignment {
  id: number
  taskId: number
  userId: number
  status: AssignmentStatus
  completedAt?: string
}

export interface RFIDCard {
  uid: string
  userId: number
  registeredAt: string
}

export interface DBData {
  users: User[]
  tasks: Task[]
  assignments: Assignment[]
  tags: Tag[]
  store: StoreItem[]
  rfidCards: RFIDCard[]
  nextIds: { user: number; task: number; assignment: number; tag: number; store: number }
}

const defaultData: DBData = {
  users: [],
  tasks: [],
  assignments: [],
  tags: [],
  store: [],
  rfidCards: [],
  nextIds: { user: 1, task: 1, assignment: 1, tag: 1, store: 1 },
}

let dbPromise: ReturnType<typeof JSONFilePreset<DBData>> | null = null

export async function getDB() {
  if (!dbPromise) {
    const file = process.env.DB_FILE || 'data/db.json'
  const dir = dirname(file)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    dbPromise = JSONFilePreset<DBData>(file, defaultData)
  }
  const db = await dbPromise
  // Lightweight migration for older DB files missing new fields
  let migrated = false
  if (!('tags' in db.data)) {
    // @ts-ignore - add missing field for older files
    ;(db.data as any).tags = []
    migrated = true
  }
  if (!('store' in db.data)) {
    ;(db.data as any).store = []
    migrated = true
  }
  if (!('rfidCards' in db.data)) {
    ;(db.data as any).rfidCards = []
    migrated = true
  }
  if (!('nextIds' in db.data)) {
    // Should never happen, but ensure structure
    // @ts-ignore
  ;(db.data as any).nextIds = { user: 1, task: 1, assignment: 1, tag: 1, store: 1 }
    migrated = true
  } else if (!('tag' in db.data.nextIds as any)) {
    // initialize tag counter based on existing tags
    const tagsArr: any[] = (db.data as any).tags || []
    const nextTag = tagsArr.length > 0 ? Math.max(...tagsArr.map(t=>Number(t.id)||0)) + 1 : 1
    // @ts-ignore
    db.data.nextIds.tag = nextTag
    migrated = true
  }
  if (!('store' in (db.data.nextIds as any))) {
    const storeArr: any[] = (db.data as any).store || []
    const nextStore = storeArr.length > 0 ? Math.max(...storeArr.map(s=>Number(s.id)||0)) + 1 : 1
    // @ts-ignore
    db.data.nextIds.store = nextStore
    migrated = true
  }
  if (migrated) await db.write()
  return db
}

export async function seedAdminIfEmpty(adminTagId?: string) {
  const db = await getDB()
  const hasUsers = db.data.users.length > 0
  if (!hasUsers) {
    const id = db.data.nextIds.user++
    db.data.users.push({ id, tagId: adminTagId || 'ADMIN_TAG', role: 'admin', points: 0 })
    await db.write()
  }
}

export async function findOrCreateUserByTag(tagId: string) {
  const db = await getDB()
  let user = db.data.users.find((u: User) => u.tagId === tagId)
  if (!user) {
    const id = db.data.nextIds.user++
    user = { id, tagId, role: 'user', points: 0 }
    db.data.users.push(user)
    await db.write()
  }
  return user
}

export async function findUserByTag(tagId: string) {
  const db = await getDB()
  return db.data.users.find((u: User) => u.tagId === tagId) || null
}

export async function createUser(tagId: string, name: string, role: Role = 'user') {
  const db = await getDB()
  const exists = db.data.users.find((u: User) => u.tagId === tagId)
  if (exists) return null
  const id = db.data.nextIds.user++
  const user: User = { id, tagId, name, role, points: 0 }
  db.data.users.push(user)
  await db.write()
  return user
}

export async function getUser(id: number) {
  const db = await getDB()
  return db.data.users.find((u: User) => u.id === id) || null
}

export async function createTask(title: string, points: number, description?: string, tag?: string) {
  const db = await getDB()
  const id = db.data.nextIds.task++
  const task: Task = { id, title, points, description, tag }
  db.data.tasks.push(task)
  await db.write()
  return task
}

export async function updateTask(id: number, data: { title?: string; points?: number; description?: string; tagId?: number | null }) {
  const db = await getDB()
  const t = db.data.tasks.find((t: Task) => t.id === id)
  if (!t) return null
  if (typeof data.title === 'string') t.title = data.title
  if (typeof data.points === 'number') t.points = data.points
  if (typeof data.description === 'string') t.description = data.description
  if (data.tagId === null) t.tagId = undefined
  if (typeof data.tagId === 'number') t.tagId = data.tagId
  await db.write()
  return t
}

export async function deleteTask(id: number) {
  const db = await getDB()
  const idx = db.data.tasks.findIndex((t: Task) => t.id === id)
  if (idx === -1) return false
  db.data.tasks.splice(idx, 1)
  // Also delete related assignments
  const assignIdx = db.data.assignments.findIndex((a: Assignment) => a.taskId === id)
  if (assignIdx !== -1) db.data.assignments.splice(assignIdx, 1)
  await db.write()
  return true
}

export async function assignTask(taskId: number, userId: number) {
  const db = await getDB()
  const id = db.data.nextIds.assignment++
  const assignment: Assignment = { id, taskId, userId, status: 'assigned' }
  db.data.assignments.push(assignment)
  await db.write()
  return assignment
}

export async function listAssignmentsForUser(userId: number) {
  const db = await getDB()
  return db.data.assignments.filter((a: Assignment) => a.userId === userId)
}

export async function listAllAssignments() {
  const db = await getDB()
  return db.data.assignments
}

export async function setAssignmentStatus(id: number, status: AssignmentStatus) {
  const db = await getDB()
  const a = db.data.assignments.find((x: Assignment) => x.id === id)
  if (!a) return null
  a.status = status
  if (status === 'pending') a.completedAt = new Date().toISOString()
  await db.write()
  return a
}

export async function approveAssignment(id: number) {
  const db = await getDB()
  const a = db.data.assignments.find((x: Assignment) => x.id === id)
  if (!a) return null
  const task = db.data.tasks.find((t: Task) => t.id === a.taskId)
  const user = db.data.users.find((u: User) => u.id === a.userId)
  if (!task || !user) return null
  a.status = 'approved'
  user.points += task.points
  await db.write()
  return { assignment: a, task, user }
}

export async function deleteAssignment(id: number) {
  const db = await getDB()
  const idx = db.data.assignments.findIndex((a: Assignment) => a.id === id)
  if (idx === -1) return false
  db.data.assignments.splice(idx, 1)
  await db.write()
  return true
}

export async function getTask(id: number) {
  const db = await getDB()
  return db.data.tasks.find((t: Task) => t.id === id) || null
}

export async function listTasks() {
  const db = await getDB()
  return db.data.tasks
}

export async function listUsers() {
  const db = await getDB()
  return db.data.users
}

export async function adjustUserPoints(userId: number, delta: number) {
  const db = await getDB()
  const user = db.data.users.find((u: User) => u.id === userId)
  if (!user) return null
  const newPoints = user.points + delta
  if (newPoints < 0) return null
  user.points = newPoints
  await db.write()
  return user
}

export async function updateUserRole(userId: number, role: Role) {
  const db = await getDB()
  const user = db.data.users.find((u: User) => u.id === userId)
  if (!user) return null
  user.role = role
  await db.write()
  return user
}

export async function deleteUser(userId: number) {
  const db = await getDB()
  const idx = db.data.users.findIndex((u: User) => u.id === userId)
  if (idx === -1) return false
  db.data.users.splice(idx, 1)
  // remove assignments belonging to user
  db.data.assignments = db.data.assignments.filter((a: Assignment) => a.userId !== userId)
  await db.write()
  return true
}

// Tags
export interface Tag {
  id: number
  name: string
  color: string // hex like #RRGGBB
}

// Store (Prämien) items
export interface StoreItem {
  id: number
  title: string
  cost: number // points required
  description?: string
}

export async function createTag(name: string, color: string) {
  const db = await getDB()
  const id = db.data.nextIds.tag++
  const tag: Tag = { id, name, color }
  db.data.tags.push(tag)
  await db.write()
  return tag
}

export async function listTags() {
  const db = await getDB()
  return db.data.tags
}

export async function deleteTag(tagId: number) {
  const db = await getDB()
  const idx = db.data.tags.findIndex((t: Tag) => t.id === tagId)
  if (idx === -1) return false
  db.data.tags.splice(idx, 1)
  // unset tagId on tasks using this tag
  db.data.tasks.forEach((t: Task) => { if (t.tagIds?.includes(tagId)) t.tagIds = t.tagIds.filter(id => id !== tagId) })
  await db.write()
  return true
}

export async function setTaskTags(taskId: number, tagIds?: number[] | null) {
  const db = await getDB()
  const t = db.data.tasks.find((t: Task) => t.id === taskId)
  if (!t) return null
  console.log('[setTaskTags] Before:', t)
  if (!tagIds || tagIds.length === 0) {
    delete t.tagIds
  } else {
    t.tagIds = tagIds
  }
  console.log('[setTaskTags] After:', t)
  await db.write()
  return t
}

// Store helpers
export async function createStoreItem(title: string, cost: number, description?: string) {
  const db = await getDB()
  const id = db.data.nextIds.store++
  const item: StoreItem = { id, title, cost, description }
  db.data.store.push(item)
  await db.write()
  return item
}

export async function listStoreItems() {
  const db = await getDB()
  return db.data.store
}

export async function deleteStoreItem(itemId: number) {
  const db = await getDB()
  const idx = db.data.store.findIndex((s: StoreItem) => s.id === itemId)
  if (idx === -1) return false
  db.data.store.splice(idx, 1)
  await db.write()
  return true
}

export async function redeemStoreItem(userId: number, itemId: number) {
  const db = await getDB()
  const user = db.data.users.find(u => u.id === userId)
  const item = db.data.store.find(s => s.id === itemId)
  if (!user || !item) return { ok: false as const, error: 'Not found' }
  if (user.points < item.cost) return { ok: false as const, error: 'Zu wenig Punkte' }
  user.points -= item.cost
  await db.write()
  return { ok: true as const, user, item }
}

// RFID Card helpers
export async function registerRFIDCard(uid: string, userId: number) {
  const db = await getDB()
  // Check if already registered
  const existing = db.data.rfidCards.find(c => c.uid === uid)
  if (existing) return null
  const card: RFIDCard = { uid, userId, registeredAt: new Date().toISOString() }
  db.data.rfidCards.push(card)
  await db.write()
  return card
}

export async function findUserByRFID(uid: string) {
  const db = await getDB()
  const card = db.data.rfidCards.find(c => c.uid === uid)
  if (!card) return null
  return db.data.users.find(u => u.id === card.userId) || null
}

export async function unregisterRFIDCard(uid: string) {
  const db = await getDB()
  const idx = db.data.rfidCards.findIndex(c => c.uid === uid)
  if (idx === -1) return false
  db.data.rfidCards.splice(idx, 1)
  await db.write()
  return true
}

export async function listRFIDCards() {
  const db = await getDB()
  return db.data.rfidCards
}

export async function getRFIDCardsForUser(userId: number) {
  const db = await getDB()
  return db.data.rfidCards.filter(c => c.userId === userId)
}
