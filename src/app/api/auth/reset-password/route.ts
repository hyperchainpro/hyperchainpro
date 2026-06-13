import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple hash using Buffer (available in both Node and Bun)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64url');
}

// ─── POST /api/auth/reset-password ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as {
      token?: string;
      password?: string;
    };

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
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

    // Find user by reset token where token hasn't expired
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    // Hash new password
    const passwordHash = hashPassword(password);

    // Update user: set new password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('[AUTH:RESET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}