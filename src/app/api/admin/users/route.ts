import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users — list users with search, filter, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && role !== 'all') {
      where.role = role;
    }
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users. Database may be unreachable.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users — bulk update (e.g. batch role changes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle single user update via list endpoint
    if (body.userId && (body.role || body.isActive !== undefined)) {
      const updateData: Record<string, unknown> = {};
      if (body.role) updateData.role = body.role;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;

      const user = await db.user.update({
        where: { id: body.userId },
        data: updateData,
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });

      return NextResponse.json(user);
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('[PUT /api/admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update users.' },
      { status: 500 }
    );
  }
}
