import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/admin/boards/[id] — delete board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.board.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/admin/boards] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete board.' },
      { status: 500 }
    );
  }
}
