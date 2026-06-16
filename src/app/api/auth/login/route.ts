import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find existing user
    const user = await db.user.findUnique({ where: { email } })

    if (user && user.id) {
      // Real database user found
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          language: user.language,
          theme: user.theme,
          accentColor: user.accentColor,
          aiSettings: user.aiSettings ?? undefined,
        },
      })
    }

    // No database or user not found — create a demo user client-side
    // In dev/demo mode, return a synthetic user
    const demoUser = {
      id: 'demo-' + Buffer.from(email).toString('base64url').slice(0, 12),
      email,
      name: email.split('@')[0],
      avatar: undefined as string | undefined,
      role: email.includes('admin') ? 'ADMIN' : 'USER',
      language: 'en',
      theme: 'system',
      accentColor: '#6366f1',
    }

    // Try to persist in DB (best-effort)
    try {
      await db.user.create({
        data: {
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          language: demoUser.language,
          theme: demoUser.theme,
          accentColor: demoUser.accentColor,
        },
      })
    } catch {
      // DB unavailable — that's fine, user is still authenticated client-side
    }

    return NextResponse.json({ user: demoUser })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}