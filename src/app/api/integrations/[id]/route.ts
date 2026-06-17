import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const integration = await db.integration.findFirst({ where: { id, userId } });
    if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ integration });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const integration = await db.integration.updateMany({ where: { id, userId }, data: body });
    return NextResponse.json({ updated: integration.count > 0 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await db.integration.deleteMany({ where: { id, userId } });
    return NextResponse.json({ deleted: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
