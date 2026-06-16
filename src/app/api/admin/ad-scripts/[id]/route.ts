import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/admin/ad-scripts/[id] — update ad script
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.platform !== undefined) updateData.platform = body.platform;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.scriptCode !== undefined) updateData.scriptCode = body.scriptCode;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.targeting !== undefined) updateData.targeting = body.targeting;

    const script = await db.adScript.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(script);
  } catch (error) {
    console.error(`[PUT /api/admin/ad-scripts] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update ad script.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ad-scripts/[id] — delete ad script
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.adScript.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/admin/ad-scripts] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete ad script.' },
      { status: 500 }
    );
  }
}
