import { NextRequest, NextResponse } from 'next/server'
import { seedAdminIfEmpty } from '@/lib/db'

export async function POST(req: NextRequest) {
  // Self-registration is disabled; users must be created by an admin.
  await seedAdminIfEmpty(process.env.ADMIN_TAG)
  return NextResponse.json({ error: 'registration disabled' }, { status: 403 })
}
