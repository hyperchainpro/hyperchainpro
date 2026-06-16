import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/boards — list boards with search, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search };
    }

    const [boards, total] = await Promise.all([
      db.board.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          isPublic: true,
          deviceType: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              members: true,
              branches: true,
              commits: true,
            },
          },
          owner: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.board.count({ where }),
    ]);

    return NextResponse.json({
      boards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/admin/boards] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards.' },
      { status: 500 }
    );
  }
}
