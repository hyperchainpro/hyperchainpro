import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_USER_ID = 'user-demo-1';
const DEMO_USER_NAME = 'Demo User';
const DEMO_USER_EMAIL = 'demo@branchboard.io';

async function ensureDemoUser() {
  const existing = await db.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!existing) {
    await db.user.create({
      data: {
        id: DEMO_USER_ID,
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
        role: 'USER',
      },
    });
  }
  return DEMO_USER_ID;
}

async function seedDemoData() {
  const userId = await ensureDemoUser();

  const demoBoards = [
    {
      name: 'Product Roadmap Q3',
      description: 'Strategic planning for Q3 product releases and milestones',
      isPublic: true,
      daysAgo: 14,
      commits: [
        { message: 'Initial roadmap layout with quarterly phases', daysAgo: 14 },
        { message: 'Add feature prioritization matrix', daysAgo: 10 },
        { message: 'Update milestones and delivery dates', daysAgo: 3 },
      ],
    },
    {
      name: 'User Flow Design',
      description: 'Mapping out the complete user journey for the onboarding experience',
      isPublic: false,
      daysAgo: 7,
      commits: [
        { message: 'Add authentication flow diagram', daysAgo: 7 },
        { message: 'Design profile setup wizard steps', daysAgo: 4 },
      ],
    },
    {
      name: 'Sprint Planning',
      description: 'Current sprint backlog and task assignments',
      isPublic: true,
      daysAgo: 3,
      commits: [
        { message: 'Populate sprint backlog items', daysAgo: 3 },
        { message: 'Assign story points and owners', daysAgo: 2 },
        { message: 'Add sprint goal and acceptance criteria', daysAgo: 1 },
      ],
    },
    {
      name: 'Architecture Diagram',
      description: 'System architecture and service dependencies',
      isPublic: false,
      daysAgo: 21,
      commits: [
        { message: 'Draw core service boundaries', daysAgo: 21 },
        { message: 'Add database layer and caching strategy', daysAgo: 18 },
        { message: 'Update API gateway routing', daysAgo: 5 },
        { message: 'Add new microservice for notifications', daysAgo: 2 },
      ],
    },
    {
      name: 'Meeting Notes',
      description: 'Brainstorming session notes and action items from team sync',
      isPublic: true,
      daysAgo: 1,
      commits: [
        { message: 'Add meeting agenda and participants', daysAgo: 1 },
      ],
    },
    {
      name: 'Wireframe v2',
      description: 'Updated wireframes for the dashboard redesign project',
      isPublic: false,
      daysAgo: 10,
      commits: [
        { message: 'Create base wireframe layout', daysAgo: 10 },
        { message: 'Add sidebar navigation components', daysAgo: 8 },
        { message: 'Update card designs and spacing', daysAgo: 6 },
        { message: 'Revise color palette and typography', daysAgo: 2 },
      ],
    },
  ];

  for (const boardData of demoBoards) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - boardData.daysAgo);

    const board = await db.board.create({
      data: {
        name: boardData.name,
        description: boardData.description,
        isPublic: boardData.isPublic,
        ownerId: userId,
        defaultBranch: 'main',
        createdAt: createdDate,
        branches: {
          create: {
            name: 'main',
            isDefault: true,
            createdAt: createdDate,
          },
        },
        members: {
          create: {
            userId,
            role: 'OWNER',
            joinedAt: createdDate,
          },
        },
      },
    });

    const mainBranch = await db.branch.findFirst({
      where: { boardId: board.id, name: 'main' },
    });

    if (mainBranch) {
      for (let i = 0; i < boardData.commits.length; i++) {
        const commitData = boardData.commits[i];
        const commitDate = new Date();
        commitDate.setDate(commitDate.getDate() - commitData.daysAgo);

        const snapshot = JSON.stringify([
          {
            id: `el-${board.id}-${i}`,
            type: 'rect',
            x: 100 + i * 50,
            y: 100 + i * 30,
            width: 200,
            height: 100,
            rotation: 0,
            content: commitData.message,
            color: '#f0f0f0',
            zIndex: i,
            locked: false,
          },
        ]);

        await db.commit.create({
          data: {
            boardId: board.id,
            branchId: mainBranch.id,
            authorId: userId,
            message: commitData.message,
            snapshot,
            createdAt: commitDate,
          },
        });
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const starred = searchParams.get('starred');

    let boards = await db.board.findMany({
      include: {
        members: true,
        branches: true,
        commits: {
          select: { id: true },
        },
        _count: {
          select: {
            members: true,
            commits: true,
            branches: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (boards.length === 0) {
      await seedDemoData();
      boards = await db.board.findMany({
        include: {
          members: true,
          branches: true,
          commits: {
            select: { id: true },
          },
          _count: {
            select: {
              members: true,
              commits: true,
              branches: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    let filtered = boards;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(lowerSearch) ||
          b.description?.toLowerCase().includes(lowerSearch)
      );
    }

    if (starred === 'true') {
      // For demo, return boards marked as public as "starred"
      filtered = filtered.filter((b) => b.isPublic);
    }

    const result = filtered.map((board) => ({
      id: board.id,
      name: board.name,
      description: board.description,
      isPublic: board.isPublic,
      thumbnail: board.thumbnail,
      defaultBranch: board.defaultBranch,
      memberCount: board._count.members,
      commitCount: board._count.commits,
      branchCount: board._count.branches,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    }));

    return NextResponse.json({ boards: result });
  } catch (error) {
    console.error('Error listing boards:', error);
    return NextResponse.json(
      { error: 'Failed to list boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isPublic = false, templateId } = body as {
      name?: string;
      description?: string;
      isPublic?: boolean;
      templateId?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      );
    }

    const userId = await ensureDemoUser();

    const board = await db.board.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic,
        ownerId: userId,
        defaultBranch: 'main',
        branches: {
          create: {
            name: 'main',
            isDefault: true,
          },
        },
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        branches: true,
      },
    });

    // Create the initial commit on the main branch (with template elements if provided)
    const mainBranch = board.branches.find((b) => b.name === 'main');

    if (mainBranch) {
      // Resolve template elements (load from JSON to avoid Turbopack issues)
      let templateElements: import('@/lib/types').BoardElement[] = [];
      if (templateId) {
        try {
          const fs = await import('fs');
          const raw = fs.readFileSync('src/lib/templates-data.json', 'utf-8');
          const allTemplates = JSON.parse(raw) as Record<string, unknown[]>;
          const rawEls = allTemplates[templateId];
          if (Array.isArray(rawEls)) {
            // Restore BoardElement type with proper types
            templateElements = rawEls.map((el: Record<string, unknown>) => ({
              id: String(el.id),
              type: String(el.type) as import('@/lib/types').ElementType,
              x: Number(el.x), y: Number(el.y),
              width: Number(el.width), height: Number(el.height),
              rotation: Number(el.rotation) || 0,
              content: String(el.content || ''),
              color: String(el.color || '#FFFFFF'),
              zIndex: Number(el.zIndex) || 0,
              locked: false, visible: el.visible !== false,
              name: String(el.name || ''),
              styles: typeof el.styles === 'string' ? JSON.parse(el.styles) : (el.styles || null),
            }));
          }
        } catch (err) {
          console.error('Failed to load template:', templateId, err);
        }
      }

      // Also save elements as BoardElements for immediate loading
      if (templateElements.length > 0) {
        await db.boardElement.createMany({
          data: templateElements.map((el) => ({
            boardId: board.id,
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation || 0,
            content: el.content || '',
            color: el.color || '#FFFFFF',
            zIndex: el.zIndex || 0,
            styles: el.styles ? JSON.stringify(el.styles) : null,
          })),
        });
      }

      await db.commit.create({
        data: {
          boardId: board.id,
          branchId: mainBranch.id,
          authorId: userId,
          message: templateId ? `Initial commit from ${templateId} template` : 'Initial commit',
          snapshot: JSON.stringify(templateElements),
        },
      });
    }

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}