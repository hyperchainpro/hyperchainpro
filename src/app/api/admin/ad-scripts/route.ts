import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/ad-scripts — list all ad scripts (or only active ones with ?active=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';

    const where = onlyActive ? { isActive: true } : {};

    const scripts = await db.adScript.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // When fetching active scripts for injection, return flat array
    if (onlyActive) {
      return NextResponse.json(scripts);
    }

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error('[GET /api/admin/ad-scripts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad scripts.' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ad-scripts — create new ad script
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.scriptCode) {
      return NextResponse.json(
        { error: 'Name and scriptCode are required.' },
        { status: 400 }
      );
    }

    const script = await db.adScript.create({
      data: {
        name: body.name,
        platform: body.platform || 'custom',
        description: body.description || null,
        scriptCode: body.scriptCode,
        position: body.position || 'head',
        isActive: body.isActive ?? false,
        priority: body.priority ?? 0,
        targeting: body.targeting || null,
      },
    });

    return NextResponse.json(script, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/ad-scripts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create ad script.' },
      { status: 500 }
    );
  }
}
