import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple hash using Buffer (available in both Node and Bun)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64url');
}

// ─── POST /api/auth/register ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, captchaToken } = body as {
      email?: string;
      name?: string;
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
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: 'USER',
        language: 'en',
        theme: 'system',
        accentColor: '#6366f1',
      },
    });

    // Create a default board for the new user
    await db.board.create({
      data: {
        name: 'My First Board',
        description: 'Your first whiteboard — start creating!',
        ownerId: user.id,
        defaultBranch: 'main',
      },
    });

    // Also create the default branch for that board
    const firstBoard = await db.board.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (firstBoard) {
      await db.branch.create({
        data: {
          boardId: firstBoard.id,
          name: 'main',
          isDefault: true,
        },
      });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: 'demo-session',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[AUTH:REGISTER] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}