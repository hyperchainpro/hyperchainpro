import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const BRANCH_NAME_REGEX = /^[a-zA-Z0-9/_-]+$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 });
    }

    const branches = await db.branch.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { commits: true } },
      },
    });

    // Get head commit for each branch
    const branchesWithHead = await Promise.all(
      branches.map(async (branch) => {
        const headCommit = await db.commit.findFirst({
          where: { branchId: branch.id },
          orderBy: { createdAt: 'desc' },
        });
        return {
          ...branch,
          commitCount: branch._count.commits,
          headCommit: headCommit
            ? {
                id: headCommit.id,
                message: headCommit.message,
                createdAt: headCommit.createdAt.toISOString(),
                authorId: headCommit.authorId,
              }
            : null,
        };
      })
    );

    return NextResponse.json(branchesWithHead);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, name } = body;

    if (!boardId || typeof boardId !== 'string') {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (!BRANCH_NAME_REGEX.test(trimmedName)) {
      return NextResponse.json(
        { error: 'Branch name can only contain alphanumeric characters, dashes, underscores, and slashes' },
        { status: 400 }
      );
    }

    const board = await db.board.findUnique({
      where: { id: boardId },
      include: { branches: true },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const existingBranch = board.branches.find(
      (b) => b.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingBranch) {
      return NextResponse.json(
        { error: `Branch "${trimmedName}" already exists on this board` },
        { status: 409 }
      );
    }

    // Get the head commit of the current default branch
    const defaultBranch = board.branches.find((b) => b.isDefault);

    if (!defaultBranch) {
      return NextResponse.json(
        { error: 'Default branch not found' },
        { status: 500 }
      );
    }

    const headCommit = await db.commit.findFirst({
      where: { branchId: defaultBranch.id },
      orderBy: { createdAt: 'desc' },
    });

    const branch = await db.branch.create({
      data: {
        boardId,
        name: trimmedName,
        isDefault: false,
      },
      include: {
        _count: {
          select: { commits: true },
        },
      },
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    );
  }
}