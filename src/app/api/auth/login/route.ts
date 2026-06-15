import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find existing user or create a demo user (dev mode)
    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Auto-create user in dev mode for easy testing
      user = await db.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'USER',
          language: 'en',
          theme: 'system',
          accentColor: '#6366f1',
        },
      })
    }

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
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}