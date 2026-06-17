import { NextRequest, NextResponse } from 'next/server';

const MCP_TOOLS = [
  { name: 'list_boards', description: 'List all boards accessible to the user', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_board_data', description: 'Get complete data for a specific board', inputSchema: { type: 'object', properties: { boardId: { type: 'string' } }, required: ['boardId'] } },
  { name: 'get_elements', description: 'Get all elements on a board', inputSchema: { type: 'object', properties: { boardId: { type: 'string' } }, required: ['boardId'] } },
  { name: 'create_element', description: 'Create a new element on a board', inputSchema: { type: 'object', properties: { boardId: { type: 'string' }, type: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } }, required: ['boardId', 'type'] } },
  { name: 'export_board', description: 'Export a board as SVG or JSON', inputSchema: { type: 'object', properties: { boardId: { type: 'string' }, format: { type: 'string', enum: ['svg', 'json'] } }, required: ['boardId', 'format'] } },
  { name: 'summarize_board', description: 'Get an AI summary of a board', inputSchema: { type: 'object', properties: { boardId: { type: 'string' } }, required: ['boardId'] } },
  { name: 'create_branch', description: 'Create a new branch on a board', inputSchema: { type: 'object', properties: { boardId: { type: 'string' }, name: { type: 'string' } }, required: ['boardId', 'name'] } },
  { name: 'push_commit', description: 'Push a commit with a message', inputSchema: { type: 'object', properties: { boardId: { type: 'string' }, branchId: { type: 'string' }, message: { type: 'string' } }, required: ['boardId', 'branchId', 'message'] } },
];

export async function GET() {
  return NextResponse.json({
    protocol: 'mcp',
    version: '2024-11-05',
    tools: MCP_TOOLS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method } = body;
    if (method === 'tools/list') {
      return NextResponse.json({ tools: MCP_TOOLS });
    }
    if (method === 'tools/call') {
      const { params: { name, arguments: args } } = body;
      const tool = MCP_TOOLS.find(t => t.name === name);
      if (!tool) return NextResponse.json({ error: `Unknown tool: ${name}` }, { status: 404 });
      // Placeholder responses - in production these would interact with the database
      if (name === 'list_boards') return NextResponse.json({ content: [{ type: 'text', text: '[]' }] });
      return NextResponse.json({ content: [{ type: 'text', text: `Tool "${name}" executed with args: ${JSON.stringify(args)}. Connect to database for live results.` }] });
    }
    return NextResponse.json({ error: 'Unknown method' }, { status: 400 });
  } catch { return NextResponse.json({ error: 'Invalid MCP request' }, { status: 400 }); }
}
