import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_USER_ID = 'user-demo-1';

// ─── GET: Get design by ID ───────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const design = await db.communityDesign.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, avatar: true, email: true },
        },
      },
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: design.id,
      title: design.title,
      description: design.description,
      userId: design.userId,
      userName: design.user?.name || 'Anonymous',
      userAvatar: design.user?.avatar || undefined,
      boardId: design.boardId,
      thumbnail: design.thumbnail,
      tags: design.tags,
      category: design.category,
      downloadCount: design.downloadCount,
      likeCount: design.likeCount,
      isFeatured: design.isFeatured,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('GET /api/community/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
  }
}

// ─── PATCH: Update design ───────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, tags, category } = body;

    const existing = await db.communityDesign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (tags !== undefined) updateData.tags = tags || null;
    if (category !== undefined) updateData.category = category;

    const updated = await db.communityDesign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ id: updated.id });
  } catch (error) {
    console.error('PATCH /api/community/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
  }
}

// ─── DELETE: Delete design ──────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.communityDesign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    await db.communityDesign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/community/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
  }
}

// ─── POST with action query param ────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json({ error: 'Action query param is required' }, { status: 400 });
    }

    const existing = await db.communityDesign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (action === 'like') {
      const updated = await db.communityDesign.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
      return NextResponse.json({ likeCount: updated.likeCount });
    }

    if (action === 'download') {
      const updated = await db.communityDesign.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      });
      return NextResponse.json({ downloadCount: updated.downloadCount });
    }

    if (action === 'feature') {
      const updated = await db.communityDesign.update({
        where: { id },
        data: { isFeatured: !existing.isFeatured },
      });
      return NextResponse.json({ isFeatured: updated.isFeatured });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/community/[id] error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
