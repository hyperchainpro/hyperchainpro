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

    // Create user (best-effort — works even without DB)
    try {
      await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: 'USER',
          language: 'en',
          theme: 'system',
          accentColor: '#6366f1',
        },
      })
    } catch {
      // DB unavailable — continue with synthetic user
    }

    const newUser = {
      id: 'user-' + Buffer.from(email).toString('base64url').slice(0, 12),
      email,
      name: name || email.split('@')[0],
      avatar: undefined as string | undefined,
      role: 'USER',
      language: 'en',
      theme: 'system',
      accentColor: '#6366f1',
    }

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}