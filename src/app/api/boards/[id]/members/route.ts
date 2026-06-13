import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/boards/[id]/members - List members of a board
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const members = await db.boardMember.findMany({
      where: { boardId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Also get the board owner info
    const board = await db.board.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    const result = members.map((m) => ({
      id: m.id,
      boardId: m.boardId,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      isOwner: board?.ownerId === m.userId,
      user: m.user,
    }));

    return NextResponse.json({ members: result });
  } catch (error) {
    console.error('Error listing members:', error);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 },
    );
  }
}

// DELETE /api/boards/[id]/members?userId=... - Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      );
    }

    // Check if user is the owner
    const board = await db.board.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.ownerId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove the board owner' },
        { status: 400 },
      );
    }

    await db.boardMember.delete({
      where: {
        boardId_userId: {
          boardId: id,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 },
    );
  }
}