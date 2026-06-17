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

interface BoardElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  color?: string;
  zIndex: number;
  locked: boolean;
}

function detectConflicts(
  sourceSnapshot: BoardElement[],
  targetSnapshot: BoardElement[]
): BoardElement[] {
  const targetMap = new Map<string, BoardElement>();
  for (const el of targetSnapshot) {
    targetMap.set(el.id, el);
  }

  const conflicts: BoardElement[] = [];

  for (const sourceEl of sourceSnapshot) {
    const targetEl = targetMap.get(sourceEl.id);
    if (targetEl) {
      // Same element ID exists in both - check if content differs
      const sourceContent = JSON.stringify({
        type: sourceEl.type,
        x: sourceEl.x,
        y: sourceEl.y,
        width: sourceEl.width,
        height: sourceEl.height,
        content: sourceEl.content,
        color: sourceEl.color,
      });
      const targetContent = JSON.stringify({
        type: targetEl.type,
        x: targetEl.x,
        y: targetEl.y,
        width: targetEl.width,
        height: targetEl.height,
        content: targetEl.content,
        color: targetEl.color,
      });

      if (sourceContent !== targetContent) {
        conflicts.push({ ...sourceEl });
      }
    }
  }

  return conflicts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, sourceBranchId, targetBranchId, title, description } = body;

    if (!boardId || typeof boardId !== 'string') {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    if (!sourceBranchId || typeof sourceBranchId !== 'string') {
      return NextResponse.json(
        { error: 'sourceBranchId is required' },
        { status: 400 }
      );
    }

    if (!targetBranchId || typeof targetBranchId !== 'string') {
      return NextResponse.json(
        { error: 'targetBranchId is required' },
        { status: 400 }
      );
    }

    if (sourceBranchId === targetBranchId) {
      return NextResponse.json(
        { error: 'Source and target branches must be different' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // Validate branches exist on the board
    const [sourceBranch, targetBranch] = await Promise.all([
      db.branch.findUnique({ where: { id: sourceBranchId } }),
      db.branch.findUnique({ where: { id: targetBranchId } }),
    ]);

    if (!sourceBranch || sourceBranch.boardId !== boardId) {
      return NextResponse.json(
        { error: 'Source branch not found on this board' },
        { status: 404 }
      );
    }

    if (!targetBranch || targetBranch.boardId !== boardId) {
      return NextResponse.json(
        { error: 'Target branch not found on this board' },
        { status: 404 }
      );
    }

    // Get latest commits from both branches
    const [sourceHead, targetHead] = await Promise.all([
      db.commit.findFirst({
        where: { branchId: sourceBranchId },
        orderBy: { createdAt: 'desc' },
      }),
      db.commit.findFirst({
        where: { branchId: targetBranchId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Detect conflicts by comparing snapshots
    let conflictData: string | null = null;
    let hasConflicts = false;

    if (sourceHead && targetHead) {
      let sourceElements: BoardElement[] = [];
      let targetElements: BoardElement[] = [];

      try {
        sourceElements = JSON.parse(sourceHead.snapshot);
      } catch {
        sourceElements = [];
      }

      try {
        targetElements = JSON.parse(targetHead.snapshot);
      } catch {
        targetElements = [];
      }

      const conflicts = detectConflicts(sourceElements, targetElements);
      hasConflicts = conflicts.length > 0;

      if (hasConflicts) {
        conflictData = JSON.stringify(conflicts);
      }
    }

    const userId = await ensureDemoUser();

    const mergeRequest = await db.mergeRequest.create({
      data: {
        boardId,
        sourceBranchId,
        targetBranchId,
        title: title.trim(),
        description: description?.trim() || null,
        authorId: userId,
        status: hasConflicts ? 'OPEN' : 'OPEN',
        conflictData,
      },
      include: {
        sourceBranch: {
          select: { id: true, name: true },
        },
        targetBranch: {
          select: { id: true, name: true },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        mergeRequest: {
          ...mergeRequest,
          hasConflicts,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating merge request:', error);
    return NextResponse.json(
      { error: 'Failed to create merge request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'MERGED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const mergeRequest = await db.mergeRequest.findUnique({
      where: { id },
      include: {
        sourceBranch: true,
        targetBranch: true,
      },
    });

    if (!mergeRequest) {
      return NextResponse.json(
        { error: 'Merge request not found' },
        { status: 404 }
      );
    }

    if (mergeRequest.status !== 'OPEN') {
      return NextResponse.json(
        { error: `Merge request is already ${mergeRequest.status}` },
        { status: 400 }
      );
    }

    let updatedMR;

    if (status === 'MERGED') {
      // Get the head commit of the source branch
      const sourceHead = await db.commit.findFirst({
        where: { branchId: mergeRequest.sourceBranchId },
        orderBy: { createdAt: 'desc' },
      });

      const userId = await ensureDemoUser();

      // Create a merge commit on the target branch with the source snapshot
      const snapshot = sourceHead?.snapshot || '[]';

      await db.commit.create({
        data: {
          boardId: mergeRequest.boardId,
          branchId: mergeRequest.targetBranchId,
          authorId: userId,
          message: `Merge ${mergeRequest.sourceBranch.name} into ${mergeRequest.targetBranch.name}: ${mergeRequest.title}`,
          snapshot,
          tag: `merge-${mergeRequest.id.substring(0, 7)}`,
        },
      });

      // Update the merge request status
      updatedMR = await db.mergeRequest.update({
        where: { id },
        data: {
          status: 'MERGED',
          resolvedAt: new Date(),
        },
        include: {
          sourceBranch: {
            select: { id: true, name: true },
          },
          targetBranch: {
            select: { id: true, name: true },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Optionally delete the source branch after merge
      if (!mergeRequest.sourceBranch.isDefault) {
        await db.branch.delete({
          where: { id: mergeRequest.sourceBranchId },
        });
      }
    } else {
      updatedMR = await db.mergeRequest.update({
        where: { id },
        data: {
          status,
          resolvedAt: new Date(),
        },
        include: {
          sourceBranch: {
            select: { id: true, name: true },
          },
          targetBranch: {
            select: { id: true, name: true },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ mergeRequest: updatedMR });
  } catch (error) {
    console.error('Error updating merge request:', error);
    return NextResponse.json(
      { error: 'Failed to update merge request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId query parameter is required' },
        { status: 400 }
      );
    }

    const mergeRequests = await db.mergeRequest.findMany({
      where: { boardId },
      include: {
        sourceBranch: {
          select: { id: true, name: true },
        },
        targetBranch: {
          select: { id: true, name: true },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ mergeRequests });
  } catch (error) {
    console.error('Error listing merge requests:', error);
    return NextResponse.json(
      { error: 'Failed to list merge requests' },
      { status: 500 }
    );
  }
}