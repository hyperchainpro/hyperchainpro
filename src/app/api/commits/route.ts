import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_USER_ID = 'user-demo-1';
const DEMO_USER_NAME = 'Demo User';
const DEMO_USER_EMAIL = 'demo@layerboard.io';

async function ensureDemoUser() {
  const existing = await db.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!existing) {
    await db.user.create({
      data: {
        id: DEMO_USER_ID,
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
        role: 'USER',
      },
    });
  }
  return DEMO_USER_ID;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, branchId, message, tag, snapshot } = body;

    if (!boardId || typeof boardId !== 'string') {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    if (!branchId || typeof branchId !== 'string') {
      return NextResponse.json(
        { error: 'branchId is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Commit message must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (snapshot === undefined || snapshot === null) {
      return NextResponse.json(
        { error: 'snapshot is required' },
        { status: 400 }
      );
    }

    const branch = await db.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.boardId !== boardId) {
      return NextResponse.json(
        { error: 'Branch not found on this board' },
        { status: 404 }
      );
    }

    const userId = await ensureDemoUser();

    // Find the previous commit on this branch to set as parent
    const previousCommit = await db.commit.findFirst({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });

    const commit = await db.commit.create({
      data: {
        boardId,
        branchId,
        authorId: userId,
        message: message.trim(),
        tag: tag?.trim() || null,
        snapshot: typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot),
        parentId: previousCommit?.id || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ commit }, { status: 201 });
  } catch (error) {
    console.error('Error creating commit:', error);
    return NextResponse.json(
      { error: 'Failed to create commit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const branchId = searchParams.get('branchId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId query parameter is required' },
        { status: 400 }
      );
    }

    const whereClause: Record<string, unknown> = { boardId };

    if (branchId) {
      whereClause.branchId = branchId;
    }

    const commits = await db.commit.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ commits });
  } catch (error) {
    console.error('Error listing commits:', error);
    return NextResponse.json(
      { error: 'Failed to list commits' },
      { status: 500 }
    );
  }
}