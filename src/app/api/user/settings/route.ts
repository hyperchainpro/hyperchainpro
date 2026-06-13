import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET /api/user/settings?userId=xxx ────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        language: true,
        theme: true,
        accentColor: true,
        aiSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER:SETTINGS:GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── POST /api/user/settings ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      language,
      theme,
      accentColor,
      aiSettings,
      name,
      avatar,
    } = body as {
      userId?: string;
      language?: string;
      theme?: string;
      accentColor?: string;
      aiSettings?: string;
      name?: string;
      avatar?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    // Build update data — only include fields that are provided
    const data: Record<string, unknown> = {};
    if (language !== undefined) data.language = language;
    if (theme !== undefined) data.theme = theme;
    if (accentColor !== undefined) data.accentColor = accentColor;
    if (aiSettings !== undefined) data.aiSettings = aiSettings;
    if (name !== undefined) data.name = name;
    if (avatar !== undefined) data.avatar = avatar;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 },
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        language: true,
        theme: true,
        accentColor: true,
        aiSettings: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER:SETTINGS:POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}