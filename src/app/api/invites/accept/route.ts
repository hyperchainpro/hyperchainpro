import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_USER_ID = 'user-demo-1';

// POST /api/invites/accept - Accept an invite by token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 },
      );
    }

    // Find the invite
    const invite = await db.boardInvite.findUnique({
      where: { token },
      include: {
        board: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 404 },
      );
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'Invite has already been accepted' },
        { status: 409 },
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 410 },
      );
    }

    // Find or create the user by email
    let user = await db.user.findUnique({
      where: { email: invite.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: invite.email,
          name: invite.email.split('@')[0],
          role: 'USER',
        },
      });
    }

    // Check if already a member
    const existingMember = await db.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: invite.boardId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      // Just mark invite as accepted
      await db.boardInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return NextResponse.json({
        message: 'Already a member, invite marked as accepted',
        board: invite.board,
      });
    }

    // Create the board member and mark invite as accepted
    await db.$transaction([
      db.boardMember.create({
        data: {
          boardId: invite.boardId,
          userId: user.id,
          role: invite.role,
        },
      }),
      db.boardInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: 'Invite accepted successfully',
      board: invite.board,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 },
    );
  }
}