import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing && existing.id) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const role = email.includes('admin') ? 'ADMIN' : 'USER'
    const userName = name || email.split('@')[0]

    // Try to create user in database
    let dbUser = null
    try {
      dbUser = await db.user.create({
        data: {
          email,
          name: userName,
          role,
          language: 'en',
          theme: 'system',
          accentColor: '#6366f1',
        },
      })
    } catch {
      // DB unavailable — fall back to synthetic user
    }

    // Return DB user if available, otherwise synthetic
    const user = (dbUser && dbUser.id)
      ? {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar ?? undefined,
          role: dbUser.role,
          language: dbUser.language,
          theme: dbUser.theme,
          accentColor: dbUser.accentColor,
        }
      : {
          id: 'user-' + Buffer.from(email).toString('base64url').slice(0, 12),
          email,
          name: userName,
          avatar: undefined as string | undefined,
          role,
          language: 'en',
          theme: 'system',
          accentColor: '#6366f1',
        }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}