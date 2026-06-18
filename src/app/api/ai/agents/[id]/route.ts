import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getUserId(request: NextRequest): string {
  const headerId = request.headers.get('x-user-id');
  if (headerId) return headerId;
  return 'user-demo-1';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);

    const agent = await db.aIAgent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // User can access: their own agents, built-in agents, or public agents
    if (agent.userId !== userId && !agent.isBuiltIn && !agent.isPublic) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error fetching AI agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);
    const body = await request.json();
    const { name, description, systemPrompt, icon, color, isPublic } = body as {
      name?: string;
      description?: string;
      systemPrompt?: string;
      icon?: string;
      color?: string;
      isPublic?: boolean;
    };

    const existing = await db.aIAgent.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Built-in agents cannot be edited
    if (existing.isBuiltIn) {
      return NextResponse.json({ error: 'Built-in agents cannot be modified' }, { status: 403 });
    }

    // Only the owner can edit
    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'You can only edit your own agents' }, { status: 403 });
    }

    const agent = await db.aIAgent.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(systemPrompt !== undefined ? { systemPrompt: systemPrompt.trim() } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error updating AI agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);

    const existing = await db.aIAgent.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Built-in agents cannot be deleted
    if (existing.isBuiltIn) {
      return NextResponse.json({ error: 'Built-in agents cannot be deleted' }, { status: 403 });
    }

    // Only the owner can delete
    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'You can only delete your own agents' }, { status: 403 });
    }

    await db.aIAgent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}