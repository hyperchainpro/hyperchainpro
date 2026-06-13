import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple hash using Buffer (available in both Node and Bun)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64url');
}

function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}

// ─── POST /api/auth/login ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, captchaToken } = body as {
      email?: string;
      password?: string;
      captchaToken?: string;
    };

    // Validate captcha
    if (!captchaToken || typeof captchaToken !== 'string' || captchaToken.trim() === '') {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Compare password
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        avatar: user.avatar ?? undefined,
        role: user.role ?? 'USER',
        language: user.language ?? 'en',
        theme: user.theme ?? 'system',
        accentColor: user.accentColor ?? '#6366f1',
        aiSettings: user.aiSettings ?? undefined,
      },
      token: 'demo-session',
    });
  } catch (error) {
    console.error('[AUTH:LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}