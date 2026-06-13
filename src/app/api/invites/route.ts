import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEMO_USER_ID = 'user-demo-1';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// POST - Create an invite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, email, role } = body;

    if (!boardId || !email || !role) {
      return NextResponse.json(
        { error: 'boardId, email, and role are required' },
        { status: 400 },
      );
    }

    const validRoles = ['EDITOR', 'VIEWER', 'REVIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be EDITOR, VIEWER, or REVIEWER' },
        { status: 400 },
      );
    }

    // Verify board exists
    const board = await db.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check for existing pending invite to the same email on this board
    const existingInvite = await db.boardInvite.findFirst({
      where: {
        boardId,
        email: email.toLowerCase().trim(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 409 },
      );
    }

    // Check if user is already a member
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      const existingMember = await db.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'This user is already a member of the board' },
          { status: 409 },
        );
      }
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await db.boardInvite.create({
      data: {
        boardId,
        inviterId: DEMO_USER_ID,
        email: email.toLowerCase().trim(),
        role,
        token,
        expiresAt,
      },
      include: {
        inviter: {
          select: { id: true, name: true, email: true },
        },
        board: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 },
    );
  }
}

// GET - List pending invites for a board
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId query parameter is required' },
        { status: 400 },
      );
    }

    const invites = await db.boardInvite.findMany({
      where: {
        boardId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error listing invites:', error);
    return NextResponse.json(
      { error: 'Failed to list invites' },
      { status: 500 },
    );
  }
}

// DELETE - Revoke an invite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json(
        { error: 'invite id query parameter is required' },
        { status: 400 },
      );
    }

    await db.boardInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 },
    );
  }
}