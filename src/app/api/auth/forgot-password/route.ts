import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, captchaToken } = body as {
      email?: string;
      captchaToken?: string;
    };

    // Validate captcha
    if (!captchaToken || typeof captchaToken !== 'string' || captchaToken.trim() === '') {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 },
      );
    }

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Find user and update — even if user doesn't exist, return 200
    // This is a security best practice to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
    }

    // In production, we would send an email here with the reset link.
    // For now, we just return success.

    return NextResponse.json({
      message: 'Password reset link sent',
    });
  } catch (error) {
    console.error('[AUTH:FORGOT] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}