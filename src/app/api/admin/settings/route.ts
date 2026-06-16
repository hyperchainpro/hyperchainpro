import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/settings — get all system settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      orderBy: { group: 'asc' },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[GET /api/admin/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings — upsert all settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Array<{ key: string; value: string; type: string; group: string }> };

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    const results = await Promise.all(
      settings.map((s) =>
        db.systemSetting.upsert({
          where: { key: s.key },
          create: {
            key: s.key,
            value: s.value,
            type: s.type || 'string',
            group: s.group || 'general',
          },
          update: {
            value: s.value,
            type: s.type || 'string',
            group: s.group || 'general',
          },
        })
      )
    );

    return NextResponse.json({ settings: results, success: true });
  } catch (error) {
    console.error('[PUT /api/admin/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings.' },
      { status: 500 }
    );
  }
}
