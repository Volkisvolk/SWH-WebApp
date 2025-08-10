import { cookies } from 'next/headers'
import { verifySession, COOKIE_NAME } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? verifySession(token) : null
  if (!session || session.role !== 'admin') redirect('/')
  return <>{children}</>
}
