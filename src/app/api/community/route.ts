import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─── Demo seed data ──────────────────────────────────────────────────────────

const DEMO_USER_ID = 'user-demo-1';

const DEMO_DESIGNS = [
  {
    title: 'Minimal Mobile Banking App',
    description: 'A clean, modern mobile banking interface with intuitive card-based layout, transaction history, and quick actions.',
    userId: DEMO_USER_ID,
    category: 'mobile-ui',
    tags: 'fintech,mobile,clean,modern',
    downloadCount: 234,
    likeCount: 891,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    title: 'SaaS Dashboard Analytics',
    description: 'Complete SaaS analytics dashboard with revenue charts, user metrics, and KPI cards. Dark mode ready.',
    userId: DEMO_USER_ID,
    category: 'dashboards',
    tags: 'analytics,saas,dashboard,charts',
    downloadCount: 456,
    likeCount: 1203,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    title: 'E-commerce Product Page',
    description: 'High-converting product page design with image gallery, size selector, reviews section, and related products.',
    userId: DEMO_USER_ID,
    category: 'web-ui',
    tags: 'ecommerce,product,conversion,shopify',
    downloadCount: 178,
    likeCount: 567,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    title: 'Social Media App Wireframe Kit',
    description: 'Comprehensive wireframe kit for social media apps including feed, stories, messaging, and profile screens.',
    userId: DEMO_USER_ID,
    category: 'wireframes',
    tags: 'social,wireframe,kit,stories',
    downloadCount: 312,
    likeCount: 745,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    title: 'Creative Portfolio Website',
    description: 'Stunning portfolio template for designers and creatives with project showcase grid and about section.',
    userId: DEMO_USER_ID,
    category: 'web-ui',
    tags: 'portfolio,creative,designer,showcase',
    downloadCount: 189,
    likeCount: 623,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    title: 'Food Delivery App UI',
    description: 'Complete food delivery app with restaurant listing, menu browsing, cart, and order tracking screens.',
    userId: DEMO_USER_ID,
    category: 'mobile-ui',
    tags: 'food,delivery,restaurant,mobile',
    downloadCount: 267,
    likeCount: 834,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  {
    title: 'Linear & Geometric Icon Pack',
    description: '200+ hand-crafted linear icons with geometric consistency. Perfect for modern interfaces.',
    userId: DEMO_USER_ID,
    category: 'icons',
    tags: 'icons,linear,geometric,minimal',
    downloadCount: 523,
    likeCount: 1567,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    title: 'Startup Landing Page Template',
    description: 'Conversion-optimized landing page for SaaS startups with hero, features, pricing, and CTA sections.',
    userId: DEMO_USER_ID,
    category: 'templates',
    tags: 'landing,startup,saas,conversion',
    downloadCount: 345,
    likeCount: 912,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
  },
  {
    title: 'Health & Fitness Dashboard',
    description: 'Personal fitness dashboard with workout tracking, nutrition logs, progress charts, and goal setting.',
    userId: DEMO_USER_ID,
    category: 'dashboards',
    tags: 'health,fitness,tracking,charts',
    downloadCount: 198,
    likeCount: 678,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
  },
  {
    title: 'Flat Illustration Pack',
    description: '50+ flat illustrations for web and mobile projects. Includes people, technology, and business scenes.',
    userId: DEMO_USER_ID,
    category: 'illustrations',
    tags: 'illustration,flat,people,scenes',
    downloadCount: 412,
    likeCount: 1345,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
  },
  {
    title: 'Chat Application Wireframe',
    description: 'Complete chat app wireframes covering one-on-one messaging, group chats, voice calls, and settings.',
    userId: DEMO_USER_ID,
    category: 'wireframes',
    tags: 'chat,messaging,wireframe,calls',
    downloadCount: 156,
    likeCount: 489,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
  },
  {
    title: 'Admin Panel UI Kit',
    description: 'Full admin panel with sidebar navigation, data tables, user management, and system settings pages.',
    userId: DEMO_USER_ID,
    category: 'templates',
    tags: 'admin,panel,management,uikit',
    downloadCount: 289,
    likeCount: 756,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
  },
  {
    title: 'Travel App Onboarding Flow',
    description: 'Beautiful onboarding screens for travel applications with location discovery and trip planning features.',
    userId: DEMO_USER_ID,
    category: 'mobile-ui',
    tags: 'travel,onboarding,mobile,discovery',
    downloadCount: 134,
    likeCount: 423,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  },
  {
    title: 'Weather App Concept',
    description: 'Elegant weather application with animated backgrounds, hourly forecasts, and location-based alerts.',
    userId: DEMO_USER_ID,
    category: 'illustrations',
    tags: 'weather,animated,concept,forecast',
    downloadCount: 201,
    likeCount: 589,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13),
  },
  {
    title: 'Design System Components',
    description: 'Comprehensive design system with buttons, inputs, cards, modals, and navigation components.',
    userId: DEMO_USER_ID,
    category: 'web-ui',
    tags: 'design-system,components,uikit,library',
    downloadCount: 567,
    likeCount: 1823,
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5),
  },
  {
    title: '3D Isometric Icon Set',
    description: 'Beautiful 3D isometric icons for tech, finance, and productivity applications. 80+ icons included.',
    userId: DEMO_USER_ID,
    category: 'icons',
    tags: '3d,isometric,icons,tech',
    downloadCount: 378,
    likeCount: 1067,
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
];

async function ensureDemoDesigns() {
  const count = await db.communityDesign.count();
  if (count === 0) {
    // Also ensure the demo user exists
    const userExists = await db.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (!userExists) {
      await db.user.create({
        data: {
          id: DEMO_USER_ID,
          email: 'demo@branchboard.app',
          name: 'Alex Chen',
          avatar: null,
          language: 'en',
          theme: 'system',
        },
      });
    }
    await db.communityDesign.createMany({ data: DEMO_DESIGNS });
  }
}

// ─── GET: List community designs ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    await ensureDemoDesigns();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const where: Record<string, unknown> = { isPublic: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { likeCount: 'desc' };
    } else if (sort === 'featured') {
      where.isFeatured = true;
      orderBy = { createdAt: 'desc' };
    }

    const [designs, total] = await Promise.all([
      db.communityDesign.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { name: true, avatar: true },
          },
        },
      }),
      db.communityDesign.count({ where }),
    ]);

    const serialized = designs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      userId: d.userId,
      userName: d.user?.name || 'Anonymous',
      userAvatar: d.user?.avatar || undefined,
      boardId: d.boardId,
      thumbnail: d.thumbnail,
      tags: d.tags,
      category: d.category,
      downloadCount: d.downloadCount,
      likeCount: d.likeCount,
      isFeatured: d.isFeatured,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({ designs: serialized, total, page, limit });
  } catch (error) {
    console.error('GET /api/community error:', error);
    return NextResponse.json({ error: 'Failed to fetch community designs' }, { status: 500 });
  }
}

// ─── POST: Upload a design ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, boardId, thumbnail, tags, category } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const design = await db.communityDesign.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: DEMO_USER_ID,
        boardId: boardId || null,
        thumbnail: thumbnail || null,
        tags: tags || null,
        category: category || 'general',
        isPublic: true,
      },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
    });

    const serialized = {
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
    };

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    console.error('POST /api/community error:', error);
    return NextResponse.json({ error: 'Failed to create community design' }, { status: 500 });
  }
}
