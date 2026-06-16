import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/analytics — return analytics data
export async function GET() {
  try {
    const [userCount, boardCount, activeUserCount, adScriptCount] = await Promise.all([
      db.user.count(),
      db.board.count(),
      db.user.count({ where: { isActive: true } }),
      db.adScript.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        activeBoards: boardCount,
        totalPlugins: 72, // Static count from DESIGN_PLUGINS
        activeAdScripts: adScriptCount,
        activeUsers: activeUserCount,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics.' },
      { status: 500 }
    );
  }
}
