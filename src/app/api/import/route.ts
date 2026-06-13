import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseSVG, parseFigmaJSON, parseImageData, parseJSONDesign } from '@/lib/import/parsers';
import type { BoardElement } from '@/lib/types';

const DEMO_USER_ID = 'user-demo-1';

const SUPPORTED_EXTENSIONS = new Set(['.svg', '.json', '.png', '.jpg', '.jpeg', '.webp', '.pdf']);
const SUPPORTED_MIME: Record<string, string> = {
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/jpeg': '.jpeg',
  'image/webp': '.webp',
  'application/json': '.json',
  'application/pdf': '.pdf',
};

function getExtension(fileName: string, mimeType: string): string {
  const dotIdx = fileName.lastIndexOf('.');
  if (dotIdx !== -1) {
    const ext = fileName.slice(dotIdx).toLowerCase();
    if (SUPPORTED_EXTENSIONS.has(ext)) return ext;
  }
  return SUPPORTED_MIME[mimeType] || '';
}

function getFileType(ext: string): string {
  const map: Record<string, string> = {
    '.svg': 'svg',
    '.json': 'json',
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.webp': 'image',
    '.pdf': 'pdf',
  };
  return map[ext] || 'unknown';
}

async function readFileAsBuffer(file: File): Promise<Buffer> {
  const arrayBuf = await file.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

async function readFileAsBase64(file: File): Promise<string> {
  const buf = await readFileAsBuffer(file);
  const mimeType = file.type || 'application/octet-stream';
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const boardId = (formData.get('boardId') as string) || 'board-demo-1';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = getExtension(file.name, file.type);
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported file type. Supported: ${[...SUPPORTED_EXTENSIONS].join(', ')}` },
        { status: 400 },
      );
    }

    const fileType = getFileType(ext);
    const fileSize = file.size;
    let elements: BoardElement[] = [];
    let error: string | null = null;

    // Create the import job record
    const job = await db.importJob.create({
      data: {
        userId: DEMO_USER_ID,
        boardId,
        fileName: file.name,
        fileType,
        fileSize,
        status: 'processing',
      },
    });

    try {
      if (fileType === 'svg') {
        const text = await readFileAsText(file);
        elements = parseSVG(text);
      } else if (fileType === 'json') {
        const text = await readFileAsText(file);
        // Try Figma format first (has `document` key), then generic
        let parsed: unknown;
        try { parsed = JSON.parse(text); } catch { parsed = null; }
        const isFigma = parsed && typeof parsed === 'object' && 'document' in (parsed as object);
        elements = isFigma ? parseFigmaJSON(text) : parseJSONDesign(text);
      } else if (fileType === 'image') {
        const base64 = await readFileAsBase64(file);
        elements = [parseImageData(base64, file.name)];
      } else if (fileType === 'pdf') {
        // PDF: treat as image — extract first page visual not easily done serverless,
        // so return a placeholder image element
        error = 'PDF import is not yet supported. Please convert to PNG or SVG first.';
      }

      if (elements.length === 0 && !error) {
        error = 'No elements could be parsed from the file.';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to parse file.';
    }

    // Update the job record
    const status = error ? 'failed' : 'completed';
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status,
        result: !error ? JSON.stringify(elements) : null,
        error,
      },
    });

    if (error) {
      return NextResponse.json({ error, jobId: job.id }, { status: 422 });
    }

    return NextResponse.json({ elements, jobId: job.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}